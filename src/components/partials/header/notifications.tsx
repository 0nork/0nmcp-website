
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link } from '@/i18n/routing';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { notifications, type Notification } from "./data";
import shortImage from "@/public/images/all-img/short-image-2.png";
import { Icon } from "@/components/ui/icon";

const Notifications = () => {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button type="button" className="relative  hidden focus:ring-none focus:outline-hidden md:h-8 md:w-8 md:bg-secondary   text-secondary-foreground    rounded-full  md:flex flex-col items-center justify-center cursor-pointer">
                    <Icon icon="heroicons-outline:bell" className="animate-tada h-5 w-5" />
                    <Badge className=" w-4 h-4 p-0 text-[8px] rounded-full  font-semibold  items-center justify-center absolute left-[calc(100%-12px)] bottom-[calc(100%-10px)]" color="destructive">
                        2
                    </Badge>
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className=" z-999 mx-4 lg:w-[320px] p-0">
                <DropdownMenuLabel>
                    <div className="flex justify-between px-4 py-3 border-b border-default-100 ">
                        <div className="text-sm text-default-800  font-medium ">
                            Notifications
                        </div>
                        <div className="text-default-800  text-xs md:text-right">
                            <Link href="/notifications" className="underline">
                                View all
                            </Link>
                        </div>
                    </div>
                </DropdownMenuLabel>
                <div className="h-[300px] xl:h-[350px]">
                    <ScrollArea className="h-full">
                        {notifications.map((item: Notification, index: number) => (
                            <DropdownMenuItem
                                key={`inbox-${index}`}
                                className="flex gap-9 py-2 px-4 cursor-pointer group">
                                <div className="flex items-start gap-2 flex-1">
                                    <div className="flex-none">
                                        <Avatar className="h-8 w-8 ">
                                            <AvatarImage src={item.avatar} />
                                            <AvatarFallback> {item.title.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                    </div>
                                    <div className="flex-1 flex flex-col gap-0.5">
                                        <div className="text-sm   text-default-600  dark:group-hover:text-default-800  font-normal   truncate">
                                            {item.title}
                                        </div>
                                        <div className="text-xs text-default-600  dark:group-hover:text-default-700 font-light line-clamp-1  ">
                                            {item.desc}
                                        </div>
                                        <div className=" text-default-400 dark:group-hover:text-default-500  text-xs"> {item.date}</div>
                                    </div>
                                </div>
                                {item.unreadmessage && (
                                    <div className="flex-0">
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

export default Notifications;
