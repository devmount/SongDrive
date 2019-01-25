<template>
  <div class="modal modal-lg" :class="{ active: active }">
    <a href="#" class="modal-overlay" aria-label="Close" @click.prevent="$emit('closed')"></a>
    <div class="modal-container">
      <div class="modal-header">
        <div class="modal-title h5">{{ song[0].title }}</div>
        <div class="h6 text-gray">{{ song[0].subtitle }}</div>
      </div>
      <div class="modal-body">
        <div class="content">
          <pre v-for="(part, i) in parsedContent" :key="i" :class="part.class">{{ part.content }}</pre>
        </div>
      </div>
      <div class="modal-footer">
        <a class="btn btn-link btn-gray" href="#" aria-label="Cancel" @click.prevent="$emit('closed')">Close</a>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SongContent',
  props: {
    active: Boolean,
    song: Object,
    chords: Boolean,
    tuning: Number,
    tunes: Array
  },
  methods: {
    isChordLine (line) {
      if (line == '') return false
      return line.slice(-2) === '  ';
    }
  },
  computed: {
    // parse song content
    parsedContent () {
      // initialize arrays for parsed linex, classes of parts, type abbr., numbers of type and part index
      var parsed = [], classes = [], types = [], numbers = [], part = 0
      var lines = this.song[0].content ? this.song[0].content.split('\n') : []
      // check every single line of song content
      for (var i = 0; i < lines.length; i++) {
        var line = lines[i]
        // handle display chord lines
        if (this.isChordLine(line) && !this.chords) {
          // skip chord line if no chords shall be displayed
          continue
        }
        // handle chord tuning
        if (this.isChordLine(line) && this.tuning != 0) {
          // init the new line to build and the current over- or underflow of spaces due to different chord string lenghts
          var newLine = '', spaces = 0, j = 0
          while (j < line.length) {
            // get single character in line
            var c = line[j]
            // handle over- or underflow of spaces to keep chords on their original position
            if (spaces > 0 && c == ' ') {
              // to few spaces: double next existing space and decrease space count
              c = '  '
              spaces--
            }
            if (spaces < 0 && c == ' ' && line[j+1] == ' ') {
              // to many spaces: skip one of two consecutive spaces and increase space count
              spaces++
              j++
              continue
            }
            // on '#': skip to next character as it will be handled together with tune
            if (c == '#') {
              j++
              continue
            }
            var isHalf = line[j+1] == '#'
            // check if character is a tune with '#'
            if (isHalf) {
              c = c + '#'
            }
            // check if character is a transposable character
            if (this.tunes.indexOf(c) > -1) {
              // replace character by next tune character
              var nextTune = this.tunes[(12 + this.tunes.indexOf(c) + (this.tuning % 12)) % 12]
              newLine += nextTune
              // update over- or underflow of spaces
              spaces += c.length - nextTune.length
            } else {
              newLine += c
            }
            j++
          }
          // make sure that last two characters stay spaces for chord line identification (rtrim and add 2 spaces)
          newLine = newLine.replace(/\s+$/, '') + '  '
          // add lines to new content
          if (!parsed[part]) {
            parsed[part] = []
          }
          parsed[part].push(newLine)
          continue
        }
        // handle normal song line
        if (line.trim().indexOf('--') < 0) {
          // only consider line if not empty
          if (line.trim() != '') {
            if (!parsed[part]) {
              parsed[part] = []
            }
            // add line to current part
            parsed[part].push(line)
          }
        }
        // handle song part marker (e.g. --V1)
        else {
          // add class to part
          switch (line.charAt(2).toLowerCase()) {
            case 'v':
              types.push('v')
              classes.push('verse ' + ((!isNaN(parseInt(line.trim().charAt(3)))) ? 'part' + line.trim().charAt(3) : ''))
              numbers.push((!isNaN(parseInt(line.trim().charAt(3)))) ? line.trim().charAt(3) : '0'); break
            case 'p':
              types.push('p')
              classes.push('prechorus')
              numbers.push((!isNaN(parseInt(line.trim().charAt(3)))) ? line.trim().charAt(3) : '0'); break
            case 'c':
              types.push('c')
              classes.push('chorus')
              numbers.push((!isNaN(parseInt(line.trim().charAt(3)))) ? line.trim().charAt(3) : '0'); break
            case 'b':
              types.push('b')
              classes.push('bridge')
              numbers.push((!isNaN(parseInt(line.trim().charAt(3)))) ? line.trim().charAt(3) : '0'); break
            case 'i':
              types.push('i')
              classes.push('intro')
              numbers.push((!isNaN(parseInt(line.trim().charAt(3)))) ? line.trim().charAt(3) : '0'); break
            case 'm':
              types.push('m')
              classes.push('mitro')
              numbers.push((!isNaN(parseInt(line.trim().charAt(3)))) ? line.trim().charAt(3) : '0'); break
            case 'o':
              types.push('o')
              classes.push('outro')
              numbers.push((!isNaN(parseInt(line.trim().charAt(3)))) ? line.trim().charAt(3) : '0'); break
            default:
              // a non existent part tag was found
          }
          // consider next part
          part++
        }
      }
      var newContent = []
      // if multiple parts: rejoin lines of every part
      if (parsed.length > 1) {
        for (var p = 1; p < parsed.length; p++) {
          newContent.push({
            type: types[p-1],
            number: numbers[p-1],
            class: classes[p-1],
            content: parsed[p].join('\n')
          })
        }
      }
      // if no parts (no markers set): take whole content as one unclassified part
      else {
        newContent.push({
          type: '',
          number: 0,
          class: '',
          content: this.song[0].content
        })
      }
      return newContent
    }
  }
}
</script>

<style lang="scss">
$bg-color-light: #1b1e1f;
$bg-color-dark: #293031;

pre {
  position: relative;
  overflow: visible;
  margin-bottom: 1.8em;
}
.verse {
  border-left: 2px solid $bg-color-dark;
  position: relative;
  padding-left: 1em;
  margin-left: .6em;
}
.verse::before {
  display: inline-block;
  position: absolute;
  background: $bg-color-light;
  left: -.45em;
  top: .35em;
  width: .8em;
  line-height: 1.3em;
  height: 1.15em;
  text-align: center;
  font-size: 2em;
  font-family: "Fira Sans";
  font-weight: 300;
}
.verse.part1::before {
  content: '1';
}
.verse.part2::before {
  content: '2';
}
.verse.part3::before {
  content: '3';
}
.verse.part4::before {
  content: '4';
}
.verse.part5::before {
  content: '5';
}
.verse.part6::before {
  content: '6';
}
.verse.part7::before {
  content: '7';
}
.verse.part8::before {
  content: '8';
}
.verse.part9::before {
  content: '9';
}
</style>
