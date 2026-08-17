import Image from "next/image";
import type { ExperienceMessage } from "@/lib/types";
import { experienceConfig } from "@/config/experience";
import { HeartIcon } from "@/components/ui/HeartIcon";

export function MessageContent({ message }: { message: ExperienceMessage }) {
  const signature = message.signature ?? experienceConfig.sender.name;

  switch (message.type) {
    case "short":
      return (
        <p className="font-serif text-2xl italic leading-relaxed text-anthracite-800 sm:text-[1.75rem]">
          {message.text}
        </p>
      );

    case "photo":
      return (
        <div className="flex flex-col gap-5">
          {message.photoSrc && (
            <div className="overflow-hidden rounded-md bg-cream-200">
              <Image
                src={message.photoSrc}
                alt={message.photoAlt ?? ""}
                width={800}
                height={600}
                className="h-auto w-full object-cover"
              />
            </div>
          )}
          <p className="whitespace-pre-line font-serif text-lg leading-relaxed text-anthracite-800">
            {message.text}
          </p>
          <Signature name={signature} />
        </div>
      );

    case "surprise":
      return (
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <HeartIcon className="h-7 w-7 text-gold-600" />
          <p className="font-serif text-xl italic leading-relaxed text-anthracite-800">
            {message.text}
          </p>
        </div>
      );

    case "letter":
    default:
      return (
        <div className="flex flex-col gap-5">
          <p className="whitespace-pre-line font-serif text-lg leading-relaxed text-anthracite-800 sm:text-xl">
            {message.text}
          </p>
          <Signature name={signature} />
        </div>
      );
  }
}

function Signature({ name }: { name: string }) {
  return <p className="font-serif text-xl italic text-anthracite-700">{name}</p>;
}
