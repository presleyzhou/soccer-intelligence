"use client";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
export function ThemeToggle(){
  const[light,setLight]=useState(false);
  useEffect(()=>{const saved=localStorage.getItem("wci-theme")==="light";setLight(saved);document.documentElement.classList.toggle("light",saved)},[]);
  function toggle(){setLight(current=>{const next=!current;document.documentElement.classList.toggle("light",next);localStorage.setItem("wci-theme",next?"light":"dark");return next})}
  return <button className="pill" onClick={toggle} aria-label="Toggle color theme">{light?<Moon size={15}/>:<Sun size={15}/>}</button>
}
