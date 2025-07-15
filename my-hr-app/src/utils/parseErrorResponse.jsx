export async function parseErrorResponse(response) {
    try {
      const contentType = response.headers.get('content-type');
  
      if (contentType?.includes('application/json')) {
        const data = await response.json();
  
        if (data.detail) return `Server Error: ${data.detail}`;
  
        return Object.entries(data)
          .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
          .join(' | ');
      }
  
      const text = await response.text();
  
      const titleMatch = text.match(/<title>(.*?)<\/title>/i);
      if (titleMatch) {
        const title = titleMatch[1];
        if (title.includes('IntegrityError')) {
          return ' Integrity Error: A slot already exists for this self-assessment.';
        }
        return `Server Error: ${title}`;
      }
  
      if (text.includes('IntegrityError')) {
        return 'Integrity Error: This self-assessment is already  linked to another meeting slot.';
      }
  
      return 'Server Error: Received unexpected HTML with no clear message.';
    } catch {
      return 'Error: Could not parse server error.';
    }
  }
  