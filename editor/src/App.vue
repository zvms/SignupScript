<script lang="ts">
import SignupEditor from "./SignupEditor.vue";
import { Parser, Union, VM } from "signup-script";
export default {
  name: "App",
  components: {
    SignupEditor,
  },
  data() {
    return {
      src: `# max 10 persons, and 202203 must has 3 persons.
must before < 10
must new in 2022
just new in 202203
a = before in 202203
b = a + 10 - before
must b >= 3
# ok!

#return -1+-1-+5==-7`,
      present: "20220101, 20220202, 20220303, 20220404, 20220505",
      neo: 20220320,
    };
  },
  computed: {
    result() {
      try {
        return VM.run(
          Parser.parse(this.src),
          this.present.split(",").map((x) => +x.trim()),
          this.neo
        );
      } catch (e) {
        return e;
      }
    },
  },
};
</script>

<template>
  <main>
    <h1>SignupScript Playground</h1>
    <VForm>
      <VTextarea label="已报名" v-model="present" />
      <VTextField label="新报名" v-model.number="neo" />
    </VForm>
    <SignupEditor v-model="src" />
    能否报名？ {{ result }}
  </main>
</template>

<style scoped></style>
