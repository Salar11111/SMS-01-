import { render, screen } from "@testing-library/react";
import { Card, Badge, Avatar, EmptyState, Alert, Panel } from "@/components/ui";

describe("Card", () => {
  it("renders children", () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText("Card content")).toBeInTheDocument();
  });

  it("applies hover styles when hover prop is true", () => {
    const { container } = render(<Card hover>Hoverable</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass("hover:shadow-[var(--shadow-card-hover)]");
    expect(card).toHaveClass("hover:-translate-y-1");
  });
});

describe("Badge", () => {
  it("renders children", () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("applies variant classes", () => {
    render(<Badge variant="success">Success</Badge>);
    expect(screen.getByText("Success")).toHaveClass("badge-success");
  });
});

describe("Avatar", () => {
  it("renders initials from name", () => {
    render(<Avatar name="John Doe" />);
    expect(screen.getByText("JD")).toBeInTheDocument();
  });

  it("applies size classes", () => {
    render(<Avatar name="John" size="lg" />);
    expect(screen.getByText("J")).toHaveClass("h-12");
    expect(screen.getByText("J")).toHaveClass("w-12");
    expect(screen.getByText("J")).toHaveClass("text-base");
  });
});

describe("EmptyState", () => {
  it("renders message", () => {
    render(<EmptyState message="No data found" />);
    expect(screen.getByText("No data found")).toBeInTheDocument();
  });

  it("renders icon when provided", () => {
    render(<EmptyState message="Empty" icon={<span data-testid="icon">!</span>} />);
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("renders action when provided", () => {
    render(<EmptyState message="Empty" action={<button data-testid="action">Action</button>} />);
    expect(screen.getByTestId("action")).toBeInTheDocument();
  });
});

describe("Alert", () => {
  it("renders children", () => {
    render(<Alert>Alert message</Alert>);
    expect(screen.getByText("Alert message")).toBeInTheDocument();
  });

  it("applies type classes", () => {
    render(<Alert type="error">Error</Alert>);
    expect(screen.getByText("Error").parentElement).toHaveClass("bg-[var(--color-error-soft)]");
    expect(screen.getByText("Error").parentElement).toHaveClass("border-[var(--color-error)]/20");
  });

  it("shows dismiss button when onDismiss provided", () => {
    const handleDismiss = vi.fn();
    render(<Alert onDismiss={handleDismiss}>Dismissible</Alert>);
    expect(screen.getByRole("button", { name: /dismiss/i })).toBeInTheDocument();
  });
});

describe("Panel", () => {
  it("renders title and children", () => {
    render(<Panel title="Panel Title">Panel content</Panel>);
    expect(screen.getByText("Panel Title")).toBeInTheDocument();
    expect(screen.getByText("Panel content")).toBeInTheDocument();
  });

  it("renders action when provided", () => {
    render(<Panel title="Title" action={<button data-testid="action">Action</button>}>Content</Panel>);
    expect(screen.getByTestId("action")).toBeInTheDocument();
  });

  it("applies outlined variant", () => {
    render(<Panel variant="outlined">Outlined</Panel>);
    const panel = screen.getByText("Outlined").closest("section");
    expect(panel).toHaveClass("border-2");
    expect(panel).toHaveClass("shadow-none");
  });
});