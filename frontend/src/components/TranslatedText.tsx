import * as React from 'react';

interface TranslatedTextProps {
  text: any;
  className?: string;
  fromLang?: string;
  fallback?: string;
}

/**
 * A robust component that renders text with improved error handling
 * Safely handles any input type (string, number, object, null, undefined)
 * Never throws errors that could crash the parent component
 */
export function TranslatedText(props: TranslatedTextProps) {
  const { fallback = '' } = props;
  
  try {
    // Handle all possible input types and prevent any errors
    const safeText = React.useMemo(() => {
      try {
        // Handle null/undefined
        if (props.text === null || props.text === undefined) {
          return fallback;
        }
        
        // Handle primitive types
        if (typeof props.text === 'string') return props.text;
        if (typeof props.text === 'number') return String(props.text);
        if (typeof props.text === 'boolean') return String(props.text);
        
        // Handle React elements (pass through)
        if (React.isValidElement(props.text)) {
          return props.text;
        }
        
        // Handle objects and arrays
        if (typeof props.text === 'object') {
          // Special case for objects with name property
          if ('name' in props.text && typeof props.text.name === 'string') {
            return props.text.name;
          }
          
          // Special case for objects with text/label/title property
          if ('text' in props.text && typeof props.text.text === 'string') {
            return props.text.text;
          }
          if ('label' in props.text && typeof props.text.label === 'string') {
            return props.text.label;
          }
          if ('title' in props.text && typeof props.text.title === 'string') {
            return props.text.title;
          }
          
          try {
            return JSON.stringify(props.text);
          } catch {
            return '[Complex Object]';
          }
        }
        
        // Default fallback for any other type
        return String(props.text);
      } catch (innerError) {
        console.error('Error processing text in TranslatedText:', innerError);
        return fallback;
      }
    }, [props.text, fallback]);
    
    // The most minimal implementation possible that can't fail
    return React.createElement(
      'span',
      props.className ? { className: props.className } : {},
      safeText
    );
  } catch (error) {
    // Ultimate fallback if anything fails
    console.error('TranslatedText failed to render:', error);
    return React.createElement('span', {}, fallback);
  }
}
