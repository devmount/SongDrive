<template>
  <div class="song-content">
    <pre v-for="(part, i) in parsedContent" :key="i" :class="part.class">{{ part.content }}</pre>
  </div>
</template>

<script>
export default {
  name: 'SongContent',
  props: {
    content: Object
  },
  computed: {
    // parse song <content>
    parsedContent () {
      // initialize arrays for parsed linex, classes of parts, type abbr., numbers of type and part index
      var parsed = [], classes = [], types = [], numbers = [], part = 0
      var lines = this.content.split('\n')
      // check every content line
      for (var i = 0; i < lines.length; i++) {
        var line = lines[i]
        // if normal song line is found
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
        // if song part is found (e.g. --V1)
        else {
          // add class to part
          switch (line.charAt(2)) {
            case 'V':
            case 'v':
              types.push('v')
              classes.push('verse ' + ((!isNaN(parseInt(line.trim().charAt(3)))) ? 'part' + line.trim().charAt(3) : ''))
              numbers.push((!isNaN(parseInt(line.trim().charAt(3)))) ? line.trim().charAt(3) : '0'); break
            case 'P':
            case 'p':
              types.push('p')
              classes.push('prechorus')
              numbers.push((!isNaN(parseInt(line.trim().charAt(3)))) ? line.trim().charAt(3) : '0'); break
            case 'C':
            case 'c':
              types.push('c')
              classes.push('chorus')
              numbers.push((!isNaN(parseInt(line.trim().charAt(3)))) ? line.trim().charAt(3) : '0'); break
            case 'B':
            case 'b':
              types.push('b')
              classes.push('bridge')
              numbers.push((!isNaN(parseInt(line.trim().charAt(3)))) ? line.trim().charAt(3) : '0'); break
            case 'I':
            case 'i':
              types.push('i')
              classes.push('intro')
              numbers.push((!isNaN(parseInt(line.trim().charAt(3)))) ? line.trim().charAt(3) : '0'); break
            case 'M':
            case 'm':
              types.push('m')
              classes.push('mitro')
              numbers.push((!isNaN(parseInt(line.trim().charAt(3)))) ? line.trim().charAt(3) : '0'); break
            case 'O':
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
        for (var j = 1; j < parsed.length; j++) {
          newContent.push({
            type: types[j-1],
            number: numbers[j-1],
            class: classes[j-1],
            content: parsed[j].join('\n')
          })
        }
      }
      // if no parts (no markers set): take whole content as one unclassified part
      else {
        newContent.push({
          type: '',
          number: 0,
          class: '',
          content: this.content
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
