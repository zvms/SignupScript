<script lang="ts">
import SignupEditor from "./SignupEditor.vue";
export default {
  name: "App",
  components: {
    SignupEditor,
  },
  data() {
    return {
      t: `# max 10 persons, and 202203 must has 3 persons.
must before < 10
must new in 2022
just new in 202203
a = before in 202203
b = a + 10 - before
must b >= 3
# ok!

#return -1+-1-+5==-7`,
    };
  },
};
</script>

<template>
  <main>
    <h1>SignupScript Playground</h1>
    <SignupEditor v-model="t" />
  </main>
</template>

<style scoped></style>
