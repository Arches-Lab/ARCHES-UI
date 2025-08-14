export interface Text {
  textid: string;              // UUID PRIMARY KEY
  storenumber: number;         // INT NOT NULL
  from: string;                // TEXT NOT NULL - sender's phone number
  to: string;                  // TEXT NOT NULL - recipient's phone number
  body: string;                // TEXT NOT NULL
  media?: string;              // BYTEA (nullable) - binary media content
  mediacontenttype?: string;   // TEXT (nullable) - content type of the media
  mediatype?: string;          // TEXT (nullable) - type of the media
  createdon: string;           // TIMESTAMP NOT NULL
  archivedby: string | null;   // TIMESTAMP (nullable)
  archivedon: string | null;   // TIMESTAMP (nullable)
  archiver?: { email: string | null; lastname: string; firstname: string; };
  media_encoded?: boolean;     // BOOLEAN (nullable) - encoded media content`
  mediaBase64?: string;        // TEXT (nullable) - base64 encoded media content
} 