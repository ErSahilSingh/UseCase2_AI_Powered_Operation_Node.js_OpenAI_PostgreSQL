import readline from "readline";
import OpenAI from "openai";
import dotenv from "dotenv";
import {
    getAllUsersService,
    getUserByIdService,
    createUserService,
    updateUserService,
    deleteUserService,
} from "../models/userModel.js";

dotenv.config();

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ─── AI Parser ────────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a database assistant. Parse user commands into JSON.
Return ONLY valid JSON, no explanation, no markdown.

Allowed actions: getAllUsers, getUserById, createUser, updateUser, deleteUser

Examples:
"show all users"                              → {"action":"getAllUsers","params":{}}
"get user 3"                                  → {"action":"getUserById","params":{"id":3}}
"create user John john@example.com"           → {"action":"createUser","params":{"name":"John","email":"john@example.com"}}
"update user 2 name Jane email jane@x.com"   → {"action":"updateUser","params":{"id":2,"name":"Jane","email":"jane@x.com"}}
"delete user 5"                               → {"action":"deleteUser","params":{"id":5}}`;

const parseCommand = async (command) => {
    const response = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: command },
        ],
    });

    const text = response.choices[0].message.content.trim();
    return JSON.parse(text);
};

// ─── Dispatcher ───────────────────────────────────────────────────────────────

const dispatch = async (action, params) => {
    switch (action) {
        case "getAllUsers":
            return await getAllUsersService();

        case "getUserById":
            return await getUserByIdService(params.id);

        case "createUser":
            return await createUserService(params.name, params.email);

        case "updateUser":
            return await updateUserService(params.id, params.name, params.email);

        case "deleteUser":
            return await deleteUserService(params.id);

        default:
            throw new Error(`Unknown action: ${action}`);
    }
};

// ─── Terminal UI ──────────────────────────────────────────────────────────────

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const printHelp = () => {
    console.log(`
  Commands you can type:
  ─────────────────────────────────────────────
  show all users
  get user <id>
  create user <name> <email>
  update user <id> name <name> email <email>
  delete user <id>
  help
  exit
  ─────────────────────────────────────────────
`);
};

const prompt = () => {
    rl.question("\n🤖 Command: ", async (input) => {
        const command = input.trim();

        if (!command) return prompt();

        if (command === "exit" || command === "quit") {
            console.log("\n👋 Goodbye!\n");
            rl.close();
            process.exit(0);
        }

        if (command === "help") {
            printHelp();
            return prompt();
        }

        try {
            console.log("\n⏳ Thinking...");

            const { action, params } = await parseCommand(command);
            console.log(
                `✅ Action detected: ${action}`,
                Object.keys(params).length ? `| Params: ${JSON.stringify(params)}` : ""
            );

            const result = await dispatch(action, params);

            if (!result || (Array.isArray(result) && result.length === 0)) {
                console.log("📭 No results found.");
            } else {
                console.log("\n📦 Result:");
                console.table(Array.isArray(result) ? result : [result]);
            }
        } catch (err) {
            if (err instanceof SyntaxError) {
                console.error("❌ AI returned invalid JSON. Try rephrasing your command.");
            } else {
                console.error("❌ Error:", err.message);
            }
        }

        prompt();
    });
};

// ─── Entry Point ──────────────────────────────────────────────────────────────

console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("  🗄️  AI-powered Database Terminal");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log('  Type "help" to see available commands');
console.log('  Type "exit" to quit');
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

prompt();