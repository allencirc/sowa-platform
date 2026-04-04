import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NewsletterSignup } from "@/components/home/NewsletterSignup";

describe("NewsletterSignup", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })
    );
  });
  it("renders heading", () => {
    render(<NewsletterSignup />);
    expect(screen.getByText("Stay Updated")).toBeInTheDocument();
  });

  it("renders email input", () => {
    render(<NewsletterSignup />);
    expect(screen.getByPlaceholderText("your@email.com")).toBeInTheDocument();
  });

  it("renders subscribe button", () => {
    render(<NewsletterSignup />);
    expect(screen.getByText("Subscribe")).toBeInTheDocument();
  });

  it("renders topic checkboxes", () => {
    render(<NewsletterSignup />);
    for (const topic of ["Careers", "Training", "Events", "Research", "Policy"]) {
      expect(screen.getByText(topic)).toBeInTheDocument();
    }
  });

  it("shows success state after submission", async () => {
    const user = userEvent.setup();
    render(<NewsletterSignup />);

    const emailInput = screen.getByPlaceholderText("your@email.com");
    await user.type(emailInput, "test@example.com");

    const submitButton = screen.getByText("Subscribe");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/subscribed/i)).toBeInTheDocument();
    });
  });

  it("does not submit with empty email", async () => {
    const user = userEvent.setup();
    render(<NewsletterSignup />);

    const submitButton = screen.getByText("Subscribe");
    await user.click(submitButton);

    // Should still show form (not success state)
    expect(screen.getByText("Stay Updated")).toBeInTheDocument();
    expect(screen.queryByText("You're subscribed!")).not.toBeInTheDocument();
  });
});
