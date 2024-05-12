'use client';

import { Button } from '@/components/ui/button';
import { Code, Loader2 } from 'lucide-react';
import { useState } from 'react';
import DynamicTable from './DynamicTable';
import { generateSql } from './action';

export default function Home() {
  const [prompt, setPrompt] = useState<string>('');
  const [schema_file, setSchemaFile] = useState<File | null>(null);
  const [connectionUrl, setConnectionUrl] = useState<string>('');
  const [result, setResult] = useState<{
    data: any;
    query: string;
  }>();
  const [showSql, setShowSQL] = useState<boolean>(false);
  const [loader, setLoader] = useState<boolean>(false);

  const generateSqlFromServer = async () => {
    setLoader(true);
    if (!schema_file || !prompt || !connectionUrl) {
      setLoader(false);
      alert('Please select a schema file and write a prompt');
      return;
    }

    let reader = new FileReader();
    reader.readAsText(schema_file);
    reader.onload = async () => {
      const schema = reader.result as string;
      const result = await generateSql(prompt, schema, connectionUrl);
      setResult(result);
      setLoader(false);
    };
  };

  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      <div className="text-3xl p-3 bg-white">Sql Generator</div>
      <div className="flex-grow flex flex-col justify-end p-3 gap-2">
        <div className="flex-grow">
          {loader && (
            <div className="flex justify-center items-center">
              <Loader2 className="animate-spin" size={45} />
            </div>
          )}
          {result && (
            <Button
              onClick={() => {
                setShowSQL(!showSql);
              }}
              className="gap-2"
            >
              Show Sql <Code />
            </Button>
          )}
          {result && showSql && (
            <div className="p-2 my-3">
              <pre className="p-3 bg-black text-white">
                {result && result.query}
              </pre>
            </div>
          )}
          {result ? (
            <DynamicTable data={result.data} />
          ) : (
            <div>Generate something</div>
          )}
        </div>
        <div className="flex">
          <input
            onChange={(e) => {
              setSchemaFile(e.target.files?.[0] || null);
            }}
            placeholder="Select your schema"
            type="file"
          />
          <input
            value={connectionUrl}
            onChange={(e) => setConnectionUrl(e.target.value)}
            className="flex-grow text-lg p-2 border-slate-800 rounded-md border-2"
            type="text"
            placeholder="Connection Url"
          />
        </div>
        <div className="flex gap-3">
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Write your prompt"
            className="flex-grow text-lg p-2 border-slate-800 rounded-md border-2"
            type="text"
          />
          <button
            onClick={() => {
              generateSqlFromServer();
            }}
            className="bg-slate-900 text-white px-2 py-1 rounded-md"
          >
            Generate Sql
          </button>
        </div>
      </div>
    </div>
  );
}