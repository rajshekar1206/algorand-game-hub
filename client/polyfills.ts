// Ensure Node-style globals exist in the browser where some deps expect them
if (typeof global === "undefined") {
  // @ts-expect-error - define global for libraries expecting Node
  // eslint-disable-next-line no-var
  var global = globalThis as unknown as typeof globalThis;
}

// Some libs may expect self to exist in workers/browsers
if (typeof self === "undefined") {
  // @ts-expect-error
  // eslint-disable-next-line no-var
  var self = globalThis as unknown as typeof globalThis;
}
