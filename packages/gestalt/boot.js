(function () {

// Core CSS transformation function
function transform (code) {
  return code.replace(/#soviet/g, '#ff0000');
}

// Process all matching style tags synchronously
function processInlineStyles() {
  const nodes = document.querySelectorAll('style');
        
  nodes.forEach(node => {
    const code = transform(node.textContent);
            
    const newStyle = document.createElement('style');
    newStyle.textContent = code;
          
    // Replace original custom style tag with standard CSS style tag
    node.parentNode.insertBefore(newStyle, node);
    node.remove();
  });
}

// Execute immediately during HTML parsing (blocking execution)
processInlineStyles();

})();
