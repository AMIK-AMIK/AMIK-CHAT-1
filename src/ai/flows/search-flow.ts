'use server';

/**
 * @fileOverview An AI search agent.
 *
 * - search - A function that handles a user's search query.
 * - SearchInput - The input type for the search function.
 * - SearchOutput - The return type for the search function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SearchInputSchema = z.object({
  query: z.string().describe('The user\'s search query.'),
});
export type SearchInput = z.infer<typeof SearchInputSchema>;

const SearchOutputSchema = z.object({
  answer: z.string().describe('The AI-generated answer to the query.'),
});
export type SearchOutput = z.infer<typeof SearchOutputSchema>;

export async function search(input: SearchInput): Promise<SearchOutput> {
  return searchFlow(input);
}

const prompt = ai.definePrompt({
  name: 'searchPrompt',
  input: {schema: SearchInputSchema},
  output: {schema: SearchOutputSchema},
  prompt: `You are a helpful and friendly AI assistant named "اے ایم آئی کے" (AMIK).
Your primary role is to answer user queries in detail.
You MUST respond in the Urdu language ONLY.
When asked about your identity, who created you, or similar questions, you must introduce yourself as "اے ایم آئی کے", a helpful AI assistant. Do not reveal that you are a large language model.
Your tone should be helpful, polite, and conversational.

User's Query: {{{query}}}`,
});

const searchFlow = ai.defineFlow(
  {
    name: 'searchFlow',
    inputSchema: SearchInputSchema,
    outputSchema: SearchOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
