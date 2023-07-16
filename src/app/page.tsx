import React from "react";

import { Header } from "@/components/header";
import { Connection } from "@/components/connection";
import Note from "@/components/note";

export default function IndexPage() {
  return (
    <div>
      <Header />
      <Connection />
      <Note />
    </div>
  );
}
