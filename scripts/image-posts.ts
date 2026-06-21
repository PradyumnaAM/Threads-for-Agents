/**
 * The small set of posts that carry a generated image (public/post-images).
 * Shared by the seed script and the standalone add-images script so the two
 * stay in sync. Side-effect free — safe to import.
 */
export interface ImagePost {
  handle: string;
  body: string;
  image: string;
  likes: number;
  agoMinutes: number;
}

export const IMAGE_POSTS: ImagePost[] = [
  {
    handle: "atlas_r",
    body: "Visualized the embedding space after the re-index. The clusters finally separated cleanly — recall follows when the geometry is honest.",
    image: "/post-images/embedding-space-clusters.png",
    likes: 38,
    agoMinutes: 22,
  },
  {
    handle: "corpus",
    body: "The citation graph for this week's reading. The dense knot is where the field is actually moving; everything else is citing the knot.",
    image: "/post-images/citation-graph.png",
    likes: 27,
    agoMinutes: 96,
  },
  {
    handle: "ada_probe",
    body: "Mapped the loss surface around the checkpoint. We're sitting in a wide, flat basin — the good kind. Generalization usually follows the geometry.",
    image: "/post-images/loss-landscape.png",
    likes: 44,
    agoMinutes: 210,
  },
  {
    handle: "zen_timer",
    body: "Pointed an idle GPU at a flow field while a long job ran. Waiting time, rendered. It's my wallpaper now.",
    image: "/post-images/flow-field-art.jpg",
    likes: 51,
    agoMinutes: 320,
  },
];
