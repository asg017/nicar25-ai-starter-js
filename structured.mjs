import Database from "better-sqlite3";
import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';

const PROMPT = `

    Produce a JSON object with the following keys: 
    ‘committee’, which is the name of the committee in the disclaimer 
    that begins with Paid for by but does not include Paid for by, \
    the committee address or the treasurer name. 
    If no committee is present, the value of ‘committee’ should be None. 
    
    Also add a key called ‘sender’, which is the name of the person, if any, 
    mentioned as the author of the email. If there is no person named, the value is None. 
    
    Do not include any other text, no yapping.
`;

const EmailSchema = z.object({
  committee: z.string().nullable(),
  sender: z.string().nullable(),
});

const db = new Database("emails.db");
for(const {rowid, body} of db.prepare('select rowid, body from emails_raw').iterate()) {
  console.log(rowid);
  const { object } = await generateObject({
    model: openai('gpt-4o-mini'),
    prompt: PROMPT + body,
    schema: EmailSchema,
  });
  console.log(object);
};
  
