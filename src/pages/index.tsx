import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";

import { SignIn, SignInButton, SignOutButton, useUser } from "@clerk/nextjs";

import { api } from "~/utils/api";
import type { RouterOutputs } from "~/utils/api";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";
import { LoadingPage } from "~/components/UserInterface/LoadingSpinner";
import { useState } from "react";

const CreatePostWizard = () => {
  const { user } = useUser();

  const ctx = api.useContext();

  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: () => {
      setInput("");
      void ctx.posts.getAll.invalidate();
    },
  });

  const [input, setInput] = useState<string>("");

  console.log(user?.id);

  if (!user) return null;
  return (
    <div className="flex w-full gap-3">
      <Image
        src={user.profileImageUrl}
        alt="User Profile Image"
        className="h-16 w-16 rounded-full"
        width={56}
        height={56}
      />
      <input
        type="text"
        placeholder="Typing..."
        className="grow bg-transparent outline-none"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={isPosting}
      />
      <button onClick={() => mutate({ content: input })}>Post</button>
    </div>
  );
};

type PostWithUser = RouterOutputs["posts"]["getAll"][number];

const PostView = (properties: PostWithUser) => {
  const { post, author } = properties;
  return (
    <div key={post.id} className="flex gap-3 border-b border-slate-400 p-4">
      <Image
        src={author.profileImageUrl}
        alt={`@${author.username}'s profile picture`}
        className="h-16 w-16 rounded-full"
        width={56}
        height={56}
      />
      <div className="flex flex-col">
        <div className="flex gap-1 text-slate-300">
          <span>{`@${author.username}`}</span>
          <span className="font-thin">{`. ${dayjs(
            post.createdAt
          ).fromNow()}`}</span>
        </div>
        <span className="text=2xl">{post.content}</span>
      </div>
    </div>
  );
};

const Feed = () => {
  const { data, isLoading: postsLoading } = api.posts.getAll.useQuery();
  if (postsLoading) return <LoadingPage />;
  if (!data) return <div>Something went wrong</div>;
  return (
    <div className="flex flex-col">
      {data.map((fullPost) => (
        <PostView key={fullPost.post.id} {...fullPost} />
      ))}
    </div>
  );
};

const Home: NextPage = () => {
  const { isLoaded: userLoaded, isSignedIn } = useUser();

  api.posts.getAll.useQuery();

  if (!userLoaded) return <div />;

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex h-screen justify-center">
        <div className="bg-white-300 h-full w-full border-x border-slate-400 md:max-w-2xl">
          <div className="border-b border-slate-400 p-4">
            {!isSignedIn && (
              <div className="flex justify-center">
                <SignInButton />
              </div>
            )}
            {!!isSignedIn && (
              <div className="flex justify-center">
                <SignOutButton />
              </div>
            )}
            {!!isSignedIn && (
              <div className="flex justify-center">
                <CreatePostWizard />
              </div>
            )}
          </div>
          <Feed />
          {/* <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" /> */}
        </div>
      </main>
    </>
  );
};

export default Home;
