// transform.js

function transform (code) {
  code.replace(/#soviet/g, '#ff0000');
  return code;
}

export { transform };
export default transform;
