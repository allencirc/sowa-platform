"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { RegistrationModal } from "./RegistrationModal";

interface RegisterButtonProps {
  type: "EVENT" | "COURSE";
  contentId: string;
  contentTitle: string;
  showDietary?: boolean;
  label?: string;
}

export function RegisterButton({
  type,
  contentId,
  contentTitle,
  showDietary = false,
  label,
}: RegisterButtonProps) {
  const [open, setOpen] = useState(false);

  const buttonLabel = label ?? (type === "EVENT" ? "Register" : "Register Interest");

  return (
    <>
      <Button variant="secondary" size="lg" className="shadow-lg" onClick={() => setOpen(true)}>
        {buttonLabel}
        <ArrowRight className="h-5 w-5" />
      </Button>

      <RegistrationModal
        open={open}
        onClose={() => setOpen(false)}
        type={type}
        contentId={contentId}
        contentTitle={contentTitle}
        showDietary={showDietary}
      />
    </>
  );
}
