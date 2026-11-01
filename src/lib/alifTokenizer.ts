import llama32kPieces from '@/data/alif_llama_32k.json';
import { getEncoding } from 'js-tiktoken';

export interface TokenChunk {
  id: number;
  text: string;
  bytes: number[];
  byteLength: number;
  colorIndex: number;
}

export interface TokenizerStats {
  tokenCount: number;
  charCount: number;
  byteCount: number;
  bytesPerToken: number;
  baselineTokens: number;
  savingsPercentage: number;
}

export type SupportedTokenizerModel =
  | 'alif-llama-32k'
  | 'gpt4o-o200k'
  | 'cl100k-base'
  | 'gemma-multilingual'
  | 'raw-byte-level';

export interface ModelOption {
  id: SupportedTokenizerModel;
  name: string;
  badge: string;
  desc: string;
}

export const TOKENIZER_MODELS: ModelOption[] = [
  {
    id: 'alif-llama-32k',
    name: 'ALIF Llama 32K (Flagship)',
    badge: 'ALIF OFFICIAL',
    desc: 'SentencePiece BPE trained specifically on 33GB Urdu corpus (32,000 vocab).',
  },
  {
    id: 'gpt4o-o200k',
    name: 'OpenAI GPT-4o (o200k_base)',
    badge: 'GPT-4o',
    desc: 'OpenAI 200,000 vocab tokenizer with improved multilingual support.',
  },
  {
    id: 'cl100k-base',
    name: 'OpenAI GPT-4 (cl100k_base)',
    badge: 'GPT-4 / 3.5',
    desc: 'Legacy OpenAI 100k base tokenizer (suffers heavy Urdu fragmentation).',
  },
  {
    id: 'gemma-multilingual',
    name: 'Google Gemma / T5 Baseline',
    badge: 'GEMMA / T5',
    desc: 'Multilingual SentencePiece baseline with partial subword compression.',
  },
  {
    id: 'raw-byte-level',
    name: 'Raw UTF-8 Byte Baseline',
    badge: 'UNOPTIMIZED',
    desc: 'Unmerged byte stream (shows raw token inflation for non-Latin script).',
  },
];

class UniversalTokenizerEngine {
  // ALIF Llama 32k pieces & scores
  private pieceToRank: Map<string, number> = new Map();
  private pieceToId: Map<string, number> = new Map();
  private isAlifReady = false;

  // Cached tiktoken instances
  private o200kEnc: ReturnType<typeof getEncoding> | null = null;
  private cl100kEnc: ReturnType<typeof getEncoding> | null = null;

  constructor() {
    this.initAlif();
  }

  private initAlif() {
    if (this.isAlifReady) return;
    const pieces = llama32kPieces as string[];

    // 0..258 are special and raw byte tokens in SentencePiece
    for (let i = 0; i < pieces.length; i++) {
      const piece = pieces[i];
      const id = 259 + i;
      this.pieceToRank.set(piece, i); // rank score: smaller index = higher priority merge
      this.pieceToId.set(piece, id);
    }
    this.isAlifReady = true;
  }

  private getTiktoken(type: 'o200k_base' | 'cl100k_base') {
    if (type === 'o200k_base') {
      if (!this.o200kEnc) {
        this.o200kEnc = getEncoding('o200k_base');
      }
      return this.o200kEnc;
    } else {
      if (!this.cl100kEnc) {
        this.cl100kEnc = getEncoding('cl100k_base');
      }
      return this.cl100kEnc;
    }
  }

  // SentencePiece BPE encoding for ALIF Llama 32k
  private encodeAlif(text: string): TokenChunk[] {
    if (!text || text.length === 0) return [];

    const words = text.split(' ');
    const allPieces: { text: string; id: number }[] = [];

    for (let wIdx = 0; wIdx < words.length; wIdx++) {
      const word = words[wIdx];
      if (!word) {
        if (wIdx < words.length - 1) {
          allPieces.push({ text: ' ', id: 259 });
        }
        continue;
      }

      // SentencePiece dummy prefix \u2581 (space replacement)
      const wordSymbol = '\u2581' + word;
      let chars = Array.from(wordSymbol);

      while (chars.length >= 2) {
        let bestPairIdx = -1;
        let bestRank = Infinity;
        let bestMerged = '';

        for (let i = 0; i < chars.length - 1; i++) {
          const candidate = chars[i] + chars[i + 1];
          const rank = this.pieceToRank.get(candidate);
          if (rank !== undefined && rank < bestRank) {
            bestRank = rank;
            bestPairIdx = i;
            bestMerged = candidate;
          }
        }

        if (bestPairIdx === -1) break;

        chars = [
          ...chars.slice(0, bestPairIdx),
          bestMerged,
          ...chars.slice(bestPairIdx + 2),
        ];
      }

      for (const piece of chars) {
        const id = this.pieceToId.get(piece) ?? 0;
        allPieces.push({ text: piece, id });
      }
    }

    const encoder = new TextEncoder();
    return allPieces.map((p, idx) => {
      const cleanText = p.text.replace(/\u2581/g, ' ');
      const rawBytes = Array.from(encoder.encode(cleanText));
      return {
        id: p.id,
        text: cleanText,
        bytes: rawBytes,
        byteLength: rawBytes.length,
        colorIndex: idx % 8,
      };
    });
  }

  // Tiktoken encoding for OpenAI models
  private encodeTiktoken(
    text: string,
    encType: 'o200k_base' | 'cl100k_base'
  ): TokenChunk[] {
    if (!text || text.length === 0) return [];
    const enc = this.getTiktoken(encType);
    const tokenIds = enc.encode(text);
    const encoder = new TextEncoder();

    return tokenIds.map((id, idx) => {
      const tokenStr = enc.decode([id]);
      const bytes = Array.from(encoder.encode(tokenStr));
      return {
        id,
        text: tokenStr,
        bytes,
        byteLength: bytes.length,
        colorIndex: idx % 8,
      };
    });
  }

  // Multilingual baseline (Google Gemma / T5 SentencePiece simulation)
  private encodeGemma(text: string): TokenChunk[] {
    if (!text || text.length === 0) return [];
    const encoder = new TextEncoder();
    const chunks: TokenChunk[] = [];
    const words = text.split(/(\s+)/);

    let tokenIdx = 0;
    for (const w of words) {
      if (!w) continue;
      if (/^\s+$/.test(w)) {
        chunks.push({
          id: 101 + tokenIdx,
          text: w,
          bytes: Array.from(encoder.encode(w)),
          byteLength: encoder.encode(w).length,
          colorIndex: tokenIdx % 8,
        });
        tokenIdx++;
        continue;
      }

      // Split into 2-character subwords for non-Latin, standard words for Latin
      const chars = Array.from(w);
      for (let i = 0; i < chars.length; i += 2) {
        const sub = chars.slice(i, i + 2).join('');
        const rawBytes = Array.from(encoder.encode(sub));
        chunks.push({
          id: 2000 + tokenIdx,
          text: sub,
          bytes: rawBytes,
          byteLength: rawBytes.length,
          colorIndex: tokenIdx % 8,
        });
        tokenIdx++;
      }
    }

    return chunks;
  }

  // Raw UTF-8 byte level fallback
  private encodeRawBytes(text: string): TokenChunk[] {
    if (!text || text.length === 0) return [];
    const encoder = new TextEncoder();
    const bytes = Array.from(encoder.encode(text));
    const decoder = new TextDecoder('utf-8', { fatal: false });

    return bytes.map((b, idx) => {
      return {
        id: b,
        text: decoder.decode(new Uint8Array([b])) || `<0x${b.toString(16).toUpperCase()}>`,
        bytes: [b],
        byteLength: 1,
        colorIndex: idx % 8,
      };
    });
  }

  // Universal encode dispatcher
  public encode(text: string, model: SupportedTokenizerModel): TokenChunk[] {
    switch (model) {
      case 'alif-llama-32k':
        return this.encodeAlif(text);
      case 'gpt4o-o200k':
        return this.encodeTiktoken(text, 'o200k_base');
      case 'cl100k-base':
        return this.encodeTiktoken(text, 'cl100k_base');
      case 'gemma-multilingual':
        return this.encodeGemma(text);
      case 'raw-byte-level':
        return this.encodeRawBytes(text);
    }
  }

  public computeStats(text: string, tokens: TokenChunk[]): TokenizerStats {
    const encoder = new TextEncoder();
    const byteCount = encoder.encode(text).length;
    const charCount = text.length;
    const tokenCount = tokens.length;
    const bytesPerToken = tokenCount > 0 ? byteCount / tokenCount : 0;

    let baselineTokens = 0;
    for (const ch of text) {
      const code = ch.charCodeAt(0);
      if (code >= 0x0600 && code <= 0x06ff) {
        baselineTokens += 2;
      } else {
        baselineTokens += 1;
      }
    }
    baselineTokens = Math.max(tokenCount, baselineTokens);

    const savingsPercentage =
      baselineTokens > 0
        ? Math.round(((baselineTokens - tokenCount) / baselineTokens) * 100)
        : 0;

    return {
      tokenCount,
      charCount,
      byteCount,
      bytesPerToken: Number(bytesPerToken.toFixed(2)),
      baselineTokens,
      savingsPercentage: Math.max(0, savingsPercentage),
    };
  }
}

export const universalTokenizer = new UniversalTokenizerEngine();
