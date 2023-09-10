import express, { Request, Response } from 'express';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = 3000;

const openai = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"], // defaults to process.env["OPENAI_API_KEY"]
});

function transfer(to: string, amount: number) {
  const transfer = {
      "to": to,
      "token": "0x3e7676937A7E96CFB7616f255b9AD9FF47363D4b", // dai
      "amount": amount,
  };
  return JSON.stringify(transfer);
}

app.get('/getTransaction', async (req: Request, res: Response) => {
  try {
    const messages: any = [
      { role: "system", content: "You turn english language into blockchain transactions by calling functions. You have some contacts already, for example Bob has the wallet address of 0x000" },
      {"role": "user", "content": "Can you send 10 DAI to Bob"}
    ];
    const functions = [
      {
          "name": "transfer",
          "description": "Send tokens from one wallet to another. Determine the amount to send and who to send it to. The to property is the wallet address of the recipient, and the amount property is a number of tokens to send.",
          "parameters": {
              "type": "object",
              "properties": {
                  "to": {
                    "type": "string",
                    "description": "the wallet address of the recipient",
                  },
                  "amount": {
                    "type": "number",
                    "description": "a number of tokens to send",
                  },
              },
              "required": ["to", "amount"],
          },
      }
    ];
    const response = await openai.chat.completions.create({
      messages,
      model: 'gpt-3.5-turbo-0613',
      functions,
    });
    const responseMessage = response.choices[0].message;

    if (responseMessage.function_call) {
      // Step 3: call the function
      // Note: the JSON response may not always be valid; be sure to handle errors
      const availableFunctions: any = {
          transfer: transfer,
      };  // only one function in this example, but you can have multiple
      const functionName = responseMessage.function_call.name;
      const functionToCall = availableFunctions[functionName];
      const functionArgs = JSON.parse(responseMessage.function_call.arguments);
      const functionResponse = functionToCall(
          functionArgs.to,
          functionArgs.unit,
      );

      console.log('functionResponse', functionResponse);

      // Step 4: send the info on the function call and function response to GPT
      messages.push(responseMessage);  // extend conversation with assistant's reply
      messages.push({
          "role": "function",
          "name": functionName,
          "content": functionResponse,
      });  // extend conversation with function response
      const secondResponse = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: messages,
      });  // get a new response from GPT where it can see the function response
      res.status(200).json(secondResponse
        ? {
            data: functionResponse,
            messages: secondResponse.choices,
          }
        : response.choices
      );
      return;
    }
    
    
    // Sending back the result as a response
    res.status(200).json(response.choices);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
