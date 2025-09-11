"use client";
import { motion } from "motion/react";
import React from "react";

export const LoaderThree = () => {
  return (
    <div
      style={{
        backgroundColor: "black",
        height: "100vh",
        width: "100vw",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <motion.svg
        xmlns="http://www.w3.org/2000/svg"
        width="96"
        height="96"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
        className=" stroke-neutral-100 [--fill-final:var(--color-yellow-500)] [--fill-initial:var(--color-neutral-800)]"
      >
        <motion.path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <motion.path
          initial={{ pathLength: 0, fill: "var(--fill-initial)" }}
          animate={{ pathLength: 1, fill: "var(--fill-final)" }}
          transition={{
            duration: 2,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "reverse",
          }}
          d="M13 3l0 7l6 0l-8 11l0 -7l-6 0l8 -11"
        />
      </motion.svg>
    </div>
  );
};
