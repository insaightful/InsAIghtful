import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export async function strictAI(
  system_prompt,
  user_prompt,
  output_format,
  default_category = "",
  output_value_only = false,
  model = "gpt-3.5-turbo",
  temperature = 1,
  num_tries = 2,
  verbose = false
) {
  // if the user input is in a list, we also process the output as a list of json
  const list_input = Array.isArray(user_prompt);
  // if the output format contains dynamic elements of < or >, then add to the prompt to handle dynamic elements
  const dynamic_elements = /<.*?>/.test(JSON.stringify(output_format));
  // if the output format contains list elements of [ or ], then we add to the prompt to handle lists
  const list_output = /\[.*?\]/.test(JSON.stringify(output_format));

  // start off with no error message
  let error_msg = "";

  for (let i = 0; i < num_tries; i++) {
    if(i==1) {
      console.log("Second Try")
    }
    let output_format_prompt = `\nYou are to output ${
      list_output && "an array of objects in"
    } the following in json format: ${JSON.stringify(
      output_format
    )}. \nDo not put quotation marks or escape character \\ in the output fields as it may cause the JSON parsing to fail.`;

    if (list_output) {
      output_format_prompt += `\nIf output field is a list, classify output into the best element of the list.`;
    }

    // if output_format contains dynamic elements, process it accordingly
    if (dynamic_elements) {
      output_format_prompt += `\nAny text enclosed by < and > indicates you must generate content to replace it. Example input: Go to <location>, Example output: Go to the garden\nAny output key containing < and > indicates you must generate the key name to replace it. Example input: {'<location>': 'description of location'}, Example output: {school: a place for education}`;
    }

    // if input is in a list format, ask it to generate json in a list
    if (list_input) {
      output_format_prompt += `\nGenerate an array of json, one json for each input element.`;
    }

    // Use OpenAI to get a response
    const response = await openai.createChatCompletion({
      temperature: temperature,
      model: model,
      messages: [
        {
          role: "system",
          content: system_prompt + output_format_prompt + error_msg,
        },
        { role: "user", content: user_prompt.toString() },
      ],
    });

    let res = response.data.choices[0].message.content;
    console.log(`This is the response ${res}`);

    if (verbose) {
      console.log(
        "System prompt:",
        system_prompt + output_format_prompt + error_msg
      );
      console.log("\nUser prompt:", user_prompt);
      console.log("\nGPT response:", res);
    }

    // try-catch block to ensure output format is adhered to
    try {
      let output = JSON.parse(res);

      if (list_input) {
        if (!Array.isArray(output)) {
          output = [output];
        }
      } else {
        output = [output];
      }

      return list_input ? output : output[0];
    } catch (e) {
      error_msg = `\n\nResult: ${res}\n\nError message: ${e}`;
      console.log("An exception occurred:", e);
      console.log("Current invalid json format ", res);
    }
  }

  return [];
}
