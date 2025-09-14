import { i } from '@instantdb/react';

const _schema = i.schema({
  entities: {
    $files: i.entity({
      path: i.string().unique().indexed(),
      url: i.string(),
    }),
    $users: i.entity({
      email: i.string().unique().indexed().optional(),
    }),
    captures: i.entity({
      movieName: i.string(),
      imdbLink: i.string(),
      timestamp: i.string(),
      frameUrl: i.string(),
      notes: i.string().optional(),
      tags: i.json().optional(),
      capturedAt: i.number().indexed(),
      published: i.boolean().indexed(),
      videoFileName: i.string().optional(),
    }),
    videos: i.entity({
      fileName: i.string().unique(),
      uploadedAt: i.number().indexed(),
      duration: i.number(),
      width: i.number(),
      height: i.number(),
      frameRate: i.number().optional(),
    }),
  },
  links: {
    videoCaptures: {
      forward: { on: 'captures', has: 'one', label: 'video' },
      reverse: { on: 'videos', has: 'many', label: 'captures' },
    },
    captureEditor: {
      forward: { on: 'captures', has: 'one', label: 'editor' },
      reverse: { on: '$users', has: 'many', label: 'captures' },
    },
    captureFile: {
      forward: { on: 'captures', has: 'one', label: 'frameFile' },
      reverse: { on: '$files', has: 'one', label: 'capture' },
    },
  },
});

// This helps Typescript display nicer intellisense
type _AppSchema = typeof _schema;
interface AppSchema extends _AppSchema {}
const schema: AppSchema = _schema;

export type { AppSchema };
export default schema;