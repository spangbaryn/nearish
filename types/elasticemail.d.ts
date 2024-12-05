declare module '@elasticemail/elasticemail-client' {
  export class ElasticEmail {
    constructor(config: { apiKey: string });
    emails: {
      send: (data: {
        Recipients: { Email: string }[];
        Content: {
          Body: { ContentType: string; Content: string }[];
          Subject: string;
          From: string;
        };
      }) => Promise<any>;
    };
  }
} 