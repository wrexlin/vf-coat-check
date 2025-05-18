import { Accessor, createContext, createEffect, createSignal, onCleanup, useContext, type Component } from 'solid-js';
import { Day, DayPass, Item, pb, toggleTheme, useAuthMethods, useAuthState, useDaypasses, useDays, useTheme } from './api';
import { Center } from './components/center';
import { TabHost } from './components/tabs';
import * as pbf from "@nedpals/pbf";
import { DayContext } from './tabs/shared';
import Passes from './tabs/Passes';
import CheckIn from './tabs/CheckIn';
import CheckOut from './tabs/CheckOut';
import LookupUID from './tabs/LookupUID';
import Inventory from './tabs/Inventory';

const App: Component = () => {
  const days = useDays();
  // const [day, setDay] = createSignal<Day | undefined>(undefined);
  const day = () => days.records.find((day) => day.start_at < new Date() && new Date() < day.end_at);

  // createEffect(() => {
  //   const check = () => {
  //     const currentDate = new Date();

  //     const d = 

  //     setDay(d);
  //   }
  //   const iv = setInterval(check, 1000 * 60);
  //   check();

  //   onCleanup(() => clearInterval(iv));
  // });

  createEffect(() => {
    console.log(day());
    console.log(JSON.stringify(days.records));
  })

  return <DayContext.Provider value={day}>
    <DayHeader />
    <div class="container">
      {day() ? <TabHost tabs={[
        ["Passes", Passes],
        ["Check-In", CheckIn],
        ["Check-Out", CheckOut],
        ["Lookup UID", LookupUID],
        ["Inventory", Inventory],
      ]} /> : <DayErrorMessage days={() => days.records} />}
    </div>
  </DayContext.Provider>
};

const DayErrorMessage: Component<{ days: () => Day[] }> = (props) => {
  return <Center style={{ "max-width": "40rem" }}>
    <div class="terminal-alert terminal-alert-error">No day available for the current date/time</div>
    <h2>Available days are:</h2>
    <ul>
      {props.days().map((day) => <li>{day.name} from {day.start_at.toLocaleString()} to {day.end_at.toLocaleString()}</li>)}
    </ul>

    <b>
      Please check the date/time of this machine, or create a new day in the admin panel for the current date/time:
    </b>

    <i>
      ({new Date().toLocaleString()})
    </i>
  </Center>
}


const DayHeader: Component<{}> = (props) => {
  const day = useContext(DayContext)!;
  const theme = useTheme();
  return <div class="container">
    <div class="terminal-nav">
      <header class="terminal-logo">
        <div class="logo terminal-prompt"><a href="/" class="no-style">Vancoufur Coat-Check Day <i> {day()?.name}</i></a></div>
      </header>
      <nav class="terminal-menu">
        <ul vocab="https://schema.org/" typeof="BreadcrumbList">
          <li>
            <a class="menu-item" property="item" on:click={(evt) => {
              evt.preventDefault();
              toggleTheme();
            }}>
              {theme() == "light" ? "Dark" : "Light"}
            </a>
          </li>
          <li style="height: 28px;"><span></span></li>
        </ul>
      </nav>
    </div>
  </div>
}

export default App;
