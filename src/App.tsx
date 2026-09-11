import type { Component } from 'solid-js';
import Hero from './components/Hero';
import Platform from './components/Platform';
import Process from './components/Process';
import Benefits from './components/Benefits';
import Categories from './components/Categories';
import Closing from './components/Closing';

const App: Component = () => {
  return (
    <main>
      <Hero />
      <Platform />
      <Process />
      <Benefits />
      <Categories />
      <Closing />
    </main>
  );
};

export default App;
