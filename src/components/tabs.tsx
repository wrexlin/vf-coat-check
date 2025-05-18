import { Component, createSignal, JSXElement } from "solid-js";
import { Dynamic } from "solid-js/web";

export const TabHost: Component<{ tabs: TabDefinition[] }> = (props) => {
   const [selected, setSelected] = createSignal(props.tabs[0]);
   const SelectedComponent = () => selected()[1];

   //  "grid-template-columns": `repeat(${props.tabs.length}, 1fr)`
   return <div class="tab-host">
      <div class="btn-group" style={{ display: "grid", "grid-template-columns": `repeat(auto-fit, minmax(100px, 1fr))` }}>
         {props.tabs.map((child) => <button
            style={{ overflow: "hidden", "text-overflow": "ellipsis" }}
            onClick={() => setSelected(child)}
            class={"btn btn-group " + (child == selected() ? "btn-primary" : "btn-default")}
         >{child[0]}</button>)}
      </div>


      <div style={{ "margin-top": "1rem" }}>
         <Dynamic component={SelectedComponent()} />
      </div>
   </div>
}

type TabDefinition = [string, Component];