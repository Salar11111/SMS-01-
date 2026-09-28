import { render, screen, fireEvent } from "@testing-library/react";
import { Input } from "@/components/ui";

describe("Input", () => {
  it("renders with placeholder", () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText("Enter text")).toBeInTheDocument();
  });

  it("shows error state", () => {
    render(<Input error helperText="This field is required" />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveClass("input-error");
    expect(screen.getByText("This field is required")).toBeInTheDocument();
  });

  it("renders icon when provided", () => {
    render(<Input icon={<span data-testid="icon">@</span>} />);
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("accepts value and onChange", () => {
    const handleChange = vi.fn();
    render(<Input value="test" onChange={handleChange} />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "test2" } });
    expect(handleChange).toHaveBeenCalled();
  });

  it("applies custom className", () => {
    render(<Input className="custom-class" />);
    expect(screen.getByRole("textbox")).toHaveClass("custom-class");
  });
});