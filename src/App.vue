<template>
  <div id="app">
    <div class="off-canvas off-canvas-sidebar-show">
      <!-- off-screen toggle button -->
      <a class="off-canvas-toggle btn btn-primary btn-action" href="#sidebar-id">
        <i class="icon icon-menu"></i>
      </a>

      <!-- off-screen sidebar -->
      <div id="sidebar-id" class="off-canvas-sidebar">
        <div class="brand text-center mt-2">
          <router-link to="/" class="logo">
            <img src="./assets/logo.svg" alt="SongDrive Song Management Tool">
            <h2>SONGDRIVE</h2>
          </router-link>
        </div>
        <ul class="menu text-uppercase">
          <li class="divider"></li>
          <li class="menu-item">
            <router-link to="/">Dashboard</router-link>
          </li>
          <li class="menu-item">
            <div class="menu-badge">
              <label v-if="ready" class="label label-primary pb-1">{{ songs.length }}</label>
              <label v-else class="label label-primary pt-1"><div class="loading d-inline-block px-2"></div></label>
            </div>
            <router-link to="/songs">Songs</router-link>
          </li>
          <li class="menu-item pb-2">
            <div class="menu-badge">
              <label class="label label-primary pb-1">???</label>
            </div>
            <router-link to="/setlists">Setlists</router-link>
          </li>
          <li class="divider" data-content="ACCOUNT">
          <li class="menu-item pt-2 pb-2">
            <div class="tile tile-centered">
              <div class="tile-icon"><img class="avatar" src="http://media.devmount.de/profile.jpg" alt="Avatar"></div>
              <div class="tile-content">
                Andreas Müller
              </div>
            </div>
          </li>
          <li class="menu-item pt-2">
            <router-link to="/profile"><i class="icon icon-people mr-2"></i> Profile</router-link>
          </li>
          <li class="menu-item">
            <router-link to="/settings"><i class="icon icon-edit mr-2"></i> Settings</router-link>
          </li>
          <li class="menu-item">
            <a href=""><i class="icon icon-arrow-right mr-2"></i> Logout</a>
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

<script>
// get database object authorized in config.js
import { db } from './firebase'

export default {
  name: 'app',
  firestore () {
    return {
      songs: {
        ref: db.collection('songs'),
        resolve: () => {
            this.ready = true
        },
        reject: () => {
            this.ready = true
        }
      },
    }
  },
  data () {
    return {
      ready: false
    }
  }
}
</script>

<style lang="scss">
// overwrite spectre variables
$primary-color: #88b544;
$error-color: #ed2f47;
$body-font-color: #a0acaf;
$bg-color: #161819;
$bg-color-light: #1b1e1f;
$bg-color-dark: #293031;
$border-color: #222627;
$gray-color: #5e6769;

// import spectre
@import "node_modules/spectre.css/src/spectre";
@import "node_modules/spectre.css/src/spectre-icons";
@import "node_modules/spectre.css/src/spectre-exp";

// positions
.m-3 { margin: .6rem !important; }
.mt-3 { margin-top: .6rem !important; }
.mr-3 { margin-right: .6rem !important; }
.mb-3 { margin-bottom: .6rem !important; }
.ml-3 { margin-left: .6rem !important; }
.mx-3 { margin-right: .6rem !important; margin-left: .6rem !important; }
.my-3 { margin-top: .6rem !important; margin-bottom: .6rem !important; }
.p-3 { padding: .6rem !important; }
.pt-3 { padding-top: .6rem !important; }
.pr-3 { padding-right: .6rem !important; }
.pb-3 { padding-bottom: .6rem !important; }
.pl-3 { padding-left: .6rem !important; }
.px-3 { padding-right: .6rem !important; padding-left: .6rem !important; }
.py-3 { padding-top: .6rem !important; padding-bottom: .6rem !important; }

// headings
h1, h2, h3, h4, h5, h6 {
  text-transform: uppercase;
  font-weight: 300;
}
.view-title {
  .loading {
    vertical-align: text-bottom;
  }
}
@media (max-width: $size-xl) {
  .view-title {
    text-align: center;
  }
}

// off-canvas
.off-canvas {
  .off-canvas-sidebar {
    min-width: 12rem;
  }

  .off-canvas-content {
    min-height: 100vh;
    padding: 1rem 2rem;
  }
}
@media (max-width: $size-xl) {
  .off-canvas {
    .off-canvas-content {
      padding: .5rem;
    }
  }
}

// branding
.brand {
  padding: 1em 1em 0 1em;

  .logo {
    padding: .3em 0;

    img {
      display: inline-block;
      width: 32px;
    }
    h2 {
      display: inline-block;
      font-size: 1.1rem;
      font-weight: 400;
      letter-spacing: 2px;
      line-height: 1.6rem;
      margin-bottom: 0;
      margin-left: .5rem;
      margin-right: .5rem;
    }
  }
}

// sidebar menu
.menu {
  box-shadow: none;
  background: $bg-color;

  .divider[data-content]::after {
    background: $bg-color;
  }

  .menu-item {
    a {
      &:hover {
        background: #202718;
      }
      &.text-error:hover {
        background: #27181c;
      }

      &.router-link-exact-active {
        background: #202718;
        color: $primary-color;
      }
    }
    .loading {
      &::after {
        border-left-color: white;
        border-bottom-color: white;
      }
    }
  }
}

// filter select field
.filter:required:invalid {
  color: $gray-color;
}
.filter option[value=""][disabled] {
  display: none;
}
.filter option {
  color: $body-font-color;
}
</style>
