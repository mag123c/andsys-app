import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SaveStatus } from "@/components/features/editor/SaveStatus";

// Simple component test - no async state
describe("SaveStatus", () => {
  it("should render saved status", async () => {
    render(<SaveStatus status="saved" />);
    expect(await screen.findByText("저장됨")).toBeInTheDocument();
  });

  it("should render saving status with spinner", async () => {
    const { container } = render(<SaveStatus status="saving" />);
    expect(await screen.findByText("저장 중...")).toBeInTheDocument();

    // Check for animate-spin class on icon
    const icon = container.querySelector("svg");
    expect(icon).toHaveClass("animate-spin");
  });

  it("should render unsaved status", async () => {
    render(<SaveStatus status="unsaved" />);
    expect(await screen.findByText("저장 대기")).toBeInTheDocument();
  });

  it("should render error status", async () => {
    render(<SaveStatus status="error" />);
    expect(await screen.findByText("저장 실패")).toBeInTheDocument();
  });

  it("should apply custom className", async () => {
    const { container } = render(
      <SaveStatus status="saved" className="custom-class" />
    );
    await screen.findByText("저장됨");
    expect(container.firstChild).toHaveClass("custom-class");
  });
});
