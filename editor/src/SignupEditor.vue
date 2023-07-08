<script lang="ts">
import { explain, highlight } from "signup-script";
import type { VNodeRef } from "vue";

import "./highlight.css";

export default {
  name: "App",
  props: {
    modelValue: {
      type: String,
      required: true,
    },
  },
  emits: ["update:modelValue"],
  data() {
    return {
      inputElement: null as any as VNodeRef,
    };
  },
  created() {},
  methods: {
    onInput(ev: Event) {
      const source = (ev.target as HTMLTextAreaElement).value;
      this.$emit("update:modelValue", source);
    },
  },
  computed: {
    explainations() {
      return explain(this.modelValue.split("\n")).map(({ text, type }) => {
        let i = 0;
        let s = "";
        for (const c of text) {
          if (c == "(") {
            i++;
            s += `<span class="bracket-${(i % 3) + 1}">(</span>`;
            continue;
          }
          if (c == ")") {
            s += `<span class="bracket-${(i % 3) + 1}">)</span>`;
            i--;
            continue;
          }
          s += c;
        }
        return { text: s + "<br/>", type };
      });
    },
    highlighted() {
      return highlight(this.modelValue.split("\n")).join("\n");
    },
  },
};
</script>

<template>
  <div class="editor py-10">
    <div style="text-align: right" class="px-2 py-0 line-num">
      <span v-for="(_, i) in modelValue.split('\n')">
        {{ i + 1 }}
        <br />
      </span>
    </div>
    <div class="container">
      <div class="script-source">
        <pre v-html="highlighted" class="script-output language-signup"></pre>
        <textarea
          :value="modelValue"
          @input="onInput"
          class="script-input"
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
          spellcheck="false"
          wrap="soft"
          ref="inputElement"
        ></textarea>
      </div>
      <div class="px-2 py-0 script-explain">
        <span
          v-for="explain in explainations"
          :class="`explain-${explain.type}`"
          v-html="explain.text"
        >
        </span>
      </div>
    </div>
  </div>
</template>

<style>
.editor {
  background-color: RGB(31, 31, 31);
  line-height: normal !important;

  display: grid;
  grid-template-columns: min-content auto;

  position: relative;
  height: 100%;
}

.line-num {
  color: RGB(110, 118, 129);
  font-family: Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace !important;
}

.container {
  display: grid;
  grid-template-columns: 40% 60%;
  line-height: normal !important;
}

.script-source {
  position: relative;
}
.script-input {
  position: absolute;
  width: 100%;
  height: 100%;
  resize: none;
  border: none;
  border-right: 2px white solid;
  color: transparent;
  white-space: nowrap;
  caret-color: white;
  overflow: auto;
  font-family: Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace !important;
}
.script-input:focus,
.script-input:active,
.script-input:hover,
.script-input:visited,
.script-input:target,
.script-input:focus-visible {
  outline: none;
}

.script-output {
  position: absolute;
  color: aliceblue;
  width: 100%;
  height: 100%;
  overflow: hidden;
  font-family: Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace !important;
}

.script-explain {
  color: aliceblue;
  overflow: auto;
  white-space: nowrap;
  font-family: Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace !important;
}
.explain-ok {
  color: aliceblue;
}
.explain-error {
  color: red;
}
</style>
