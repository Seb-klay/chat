
type role = "user" | "assistant" | "system";

export interface IMessage {
    role: role,
    content: string,
    model?: string,
}

export interface IAnswer {
    model: string,
    created_at: string,
    response: string,
    done: boolean,
    done_reason?: string,
    context?: number[]
}
// {"model":"tinyllama","created_at":"2025-10-16T17:56:49.249317848Z","response":"","done":true,"done_reason":"stop","context":[529,29989]