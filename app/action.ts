'use server'

import {GoogleGenerativeAI} from '@google/generative-ai'
import { Client } from 'pg';


const google_api_key = process.env.GOOGLE_GEMINI_API;


if(!google_api_key) {
    throw new Error('google api is not set!!')
}

const gen_ai = new GoogleGenerativeAI(google_api_key);

const model = gen_ai.getGenerativeModel({
    model:'gemini-1.5-pro-latest',
})

async function getDatafromDatabase(connection_url:string,query:string){
    try {
        const client = new Client({
            connectionString: connection_url
        })
        await client.connect();

        const result = await client.query(query);

        return result.rows;
    } catch (error) {
        console.log(
            'There was some error while fetching the data from the database'
          );
          console.log(error);
          throw error;
        
    }
}

export const generateSql = async(prompt:string,schema_text:string,connection_url:string) => {
    const bot_prompt = `You are a sql generator bot that generates sql queries base on the a given sql schema and user prompt. You only output sql query. Don't use \`\`\`sql or anything like that. I want only sql query that i can directly pass to the database. user asked ${prompt}. Your schema is \n ${schema_text}`;

    const result = await model.generateContent(bot_prompt);
    const response = await result.response;
    const text = response.text();

    const data = await getDatafromDatabase(connection_url,text);

    return {
        data,query:text
    }
}