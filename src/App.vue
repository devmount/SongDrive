<template>
  <div id="app">
    <div class="off-canvas off-canvas-sidebar-show">
      <!-- off-screen toggle button -->
      <a class="off-canvas-toggle btn btn-primary btn-action" href="#sidebar-id">
        <i class="icon icon-menu"></i>
      </a>

      <!-- off-screen sidebar -->
      <div id="sidebar-id" class="off-canvas-sidebar">
        <ul class="menu">
          <li class="menu-item">
            <div class="tile tile-centered">
              <div class="tile-icon"><img class="avatar" src="http://media.devmount.de/profile.jpg" alt="Avatar"></div>
              <div class="tile-content">
                Andreas Müller
              </div>
            </div>
          </li>
          <li class="divider"></li>
          <li class="menu-item">
            <router-link to="/">Dashboard</router-link>
          </li>
          <li class="menu-item">
            <router-link to="/">Profile</router-link>
          </li>
          <li class="menu-item">
            <div class="menu-badge">
              <label class="label label-primary">203</label>
            </div>
            <router-link to="/about">Songs</router-link>
          </li>
          <li class="menu-item">
            <div class="menu-badge">
              <label class="label label-primary">132</label>
            </div>
            <router-link to="/about">Setlists</router-link>
          </li>
        </ul>
      </div>
      <a class="off-canvas-overlay" href="#close"></a>

      <!-- off-screen content -->
      <div class="off-canvas-content">
        <router-view/>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
$primary-color: #88b544;
$error-color: #ed2f47;
$body-font-color: #798a8e;
$bg-color: #1b1e1f;
$bg-color-light: #1b1e1f;
$bg-color-dark: #2c3638;
$border-color: #222627;

@import "node_modules/spectre.css/src/spectre";
@import "node_modules/spectre.css/src/spectre-icons";
@import "node_modules/spectre.css/src/spectre-exp";

#app {

}
.menu {
  a {
    &.router-link-exact-active {
      color: $primary-color;
    }
  }
}
</style>
