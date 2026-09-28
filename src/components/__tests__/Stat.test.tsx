import { render, screen } from "@testing-library/react";
import { Stat } from "@/components/ui";

describe("Stat", () => {
  it("renders label and value", () => {
    render(<Stat label="Students" value={42} />);
    expect(screen.getByText("Students")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("renders trend up", () => {
    render(<Stat label="Enrollment" value={100} trend="up" trendLabel="+10%" />);
    expect(screen.getByText("↑ +10%")).toBeInTheDocument();
    expect(screen.getByText("↑ +10%")).toHaveClass("text-[var(--color-success)]");
  });

  it("renders trend down", () => {
    render(<Stat label="Attendance" value={90} trend="down" trendLabel="-5%" />);
    expect(screen.getByText("↓ -5%")).toBeInTheDocument();
    expect(screen.getByText("↓ -5%")).toHaveClass("text-[var(--color-error)]");
  });

  it("renders trend neutral", () => {
    render(<Stat label="Classes" value={10} trend="neutral" />);
    expect(screen.getByText("→ neutral")).toBeInTheDocument();
    expect(screen.getByText("→ neutral")).toHaveClass("text-[var(--color-slate-muted)]");
  });
});