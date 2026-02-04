import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Dialog from "../../components/dialogs/dialogs";
import { IMessage } from "@/app/utils/chatUtils";

const baseModel = { id: 1 };

const messages: IMessage[] = [
  {
    role: "system",
    model: baseModel,
    content: "You should not see this",
  },
  {
    role: "user",
    model: baseModel,
    content: "Hello **world**",
  },
  {
    role: "assistant",
    model: baseModel,
    content: "Hi there!",
  },
];

describe("Dialog", () => {
  it("filters out system messages", () => {
    render(<Dialog messages={messages} />);

    expect(
      screen.queryByText("You should not see this"),
    ).not.toBeInTheDocument();
  });

  it("renders user and assistant messages", () => {
    render(<Dialog messages={messages} />);

    expect(screen.getByText("Hello")).toBeInTheDocument();
    expect(screen.getByText("Hi there!")).toBeInTheDocument();
  });

  it("renders markdown content", () => {
    render(<Dialog messages={messages} />);

    // ReactMarkdown renders <strong>
    expect(screen.getByText("world")).toBeInTheDocument();
  });
});
