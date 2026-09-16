import { registerRootComponent } from 'expo';
import App from './App';

// Registers the root component and mounts it to #root on web
// (and registers 'main' on native). Required for `expo export` /
// webpack builds, which use this file as the entry — App.js alone
// never mounts anything.
registerRootComponent(App);
