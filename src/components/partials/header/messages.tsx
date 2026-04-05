
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link } from '@/i18n/routing';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { messages, type Message } from "./data";
import { Icon } from "@/components/ui/icon";

const Messages = () => {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button type="button" className="relative focus:ring-none focus:outline-hidden md:h-8 md:w-8 md:bg-secondary  text-secondary-foreground    rounded-full  md:flex hidden flex-col items-center justify-center cursor-pointer">
                    <Icon icon="heroicons-outline:mail" className="h-5 w-5" />
                    <Badge className=" w-4 h-4 p-0 text-[8px] rounded-full  font-semibold  items-center justify-center absolute left-[calc(100%-12px)] bottom-[calc(100%-10px)] " color="destructive">
                        10
                    </Badge>
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className=" z-999 mx-4 lg:w-[320px] p-0" >
                <DropdownMenuLabel>
                    <div className="flex justify-between px-4 py-3 border-b border-default-100 ">
                        <div className="text-sm text-default-800  font-medium ">
                            Messages
                        </div>
                        <div className="text-default-800  text-xs md:text-right">
                            <Link href="/chats" className="underline">
                                View all
                            </Link>
                        </div>
                    </div>
                </DropdownMenuLabel>
                <div className="h-[300px] xl:h-[350px]">
                    <ScrollArea className="h-full">
                        {messages?.map((item: Message, index: number) => (
                            <DropdownMenuItem key={`inbox-${index}`} className="flex  items-start gap-3 py-2 px-4 cursor-pointer group ">
                                <div className="flex-none">
                                    <Avatar className="h-8 w-8 ">
                                        <AvatarImage src={item?.image} />
                                        <AvatarFallback> {item.title.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                </div>
                                <div className="flex-1 flex flex-col gap-0.5">
                                    <div className="text-default-800  text-sm font-medium ">
                                        {item.title}
                                    </div>
                                    <div className="text-xs text-default-600  dark:group-hover:text-default-700 ">
                                        {item.desc}
                                    </div>
                                    <div className="text-default-400 dark:text-default-500 dark:group-hover:text-default-600 text-xs">
                                        3 min ago
                                    </div>
                                </div>
                                {item.hasnotifaction && (
                                    <div className="flex-none">
                                        <span className="h-[10px] w-[10px] bg-destructive border border-destructive-foreground dark:border-default-400 rounded-full inline-block" />
                                    </div>
                                )}
                            </DropdownMenuItem>
                        ))}
                    </ScrollArea>
                </div>

            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default Messages;
