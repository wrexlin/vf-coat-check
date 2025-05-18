import { Component, JSX, JSXElement } from "solid-js";

export const Center: Component<{ children: JSXElement, style?: JSX.CSSProperties }> = (props) => {
   return <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0, display: 'flex', "justify-content": "center", "align-items": "center" }}>
      <div style={props.style}>
         {props.children}
      </div>
   </div>
}