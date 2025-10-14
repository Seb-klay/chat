export interface Answer {
    model: string,
    created_at: string,
    response: string,
    done: boolean,
    done_reason?: string,
    context?: []
}