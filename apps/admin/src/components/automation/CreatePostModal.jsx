"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2, CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { AutomationService } from "@/lib/automation.service";
import { toast } from "sonner";
import { NeoModal } from "@/components/ui/neo-modal";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";








export function CreatePostModal({ isOpen, onClose, onSuccess, accounts }) {
  const [authorId, setAuthorId] = useState("");
  const [text, setText] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [date, setDate] = useState(undefined);
  const [time, setTime] = useState("12:00");
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handlePreSubmit = (e) => {
    e.preventDefault();
    if (!authorId || !text || !date) {
      toast.error("Please fill in all required fields");
      return;
    }

    const [hours, minutes] = time.split(":").map(Number);
    const scheduledDate = new Date(date);
    scheduledDate.setHours(hours);
    scheduledDate.setMinutes(minutes);

    if (scheduledDate <= new Date()) {
      toast.error("Scheduled time must be in the future");
      return;
    }

    setShowConfirmation(true);
  };

  const handleConfirmSubmit = async () => {
    if (!date) return;

    setLoading(true);
    try {
      const [hours, minutes] = time.split(":").map(Number);
      const scheduledDate = new Date(date);
      scheduledDate.setHours(hours);
      scheduledDate.setMinutes(minutes);

      await AutomationService.createScheduledPost({
        authorId,
        content: {
          text,
          mediaType: mediaUrl ? "image" : "none",
          mediaUrl,
          type: "standard"
        },
        scheduledFor: scheduledDate.toISOString()
      });

      toast.success("Post scheduled successfully");
      onSuccess();
      onClose();
      // Reset form
      setText("");
      setMediaUrl("");
      setDate(undefined);
      setShowConfirmation(false);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to schedule post");
    } finally {
      setLoading(false);
    }
  };

  const selectedAccount = accounts.find((a) => a.user._id === authorId);
  console.log(accounts);
  return (
    <>
            <NeoModal
        isOpen={isOpen}
        onClose={onClose}
        title="Schedule New Post"
        description="Create content and schedule it for later.">
        
                <form onSubmit={handlePreSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Post As</Label>
                        <Select onValueChange={setAuthorId} value={authorId}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select account" />
                            </SelectTrigger>
                            <SelectContent className="max-h-[300px]">
                                {accounts.length === 0 ?
                <div className="p-2 text-sm text-muted-foreground text-center">No managed accounts found</div> :

                accounts.map((account) =>
                <SelectItem key={account.user._id} value={account.user._id}>
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-6 w-6">
                                                    <AvatarImage src={account.user.profilePicture?.url} />
                                                    <AvatarFallback>{account.user.username?.[0]}</AvatarFallback>
                                                </Avatar>
                                                <span>@{account.user.username}</span>
                                            </div>
                                        </SelectItem>
                )
                }
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Content</Label>
                        <Textarea
              placeholder="What's on your mind?"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              className="resize-none" />
            
                    </div>

                    <div className="space-y-2">
                        <Label>Image URL (Optional)</Label>
                        <Input
              placeholder="https://..."
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)} />
            
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2 flex flex-col">
                            <Label>Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                    variant={"outline"}
                    className={cn(
                      "w-full pl-3 text-left font-normal",
                      !date && "text-muted-foreground"
                    )}>
                    
                                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(date) =>
                    date < new Date(new Date().setHours(0, 0, 0, 0))
                    }
                    initialFocus />
                  
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="space-y-2">
                            <Label>Time</Label>
                            <div className="relative">
                                <Input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="pl-9" />
                
                                <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button type="button" variant="outline" onClick={onClose} className="mr-2">
                            Cancel
                        </Button>
                        <Button type="submit">
                            Review Schedule
                        </Button>
                    </div>
                </form>
            </NeoModal>

            {/* Confirmation Modal */}
            <NeoModal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        title="Confirm Schedule"
        description="Please review the details before scheduling."
        variant="warning">
        
                <div className="space-y-4">
                    <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                        <div className="flex justify-between border-b pb-2">
                            <span className="font-medium text-muted-foreground">Account</span>
                            <span className="font-semibold">@{selectedAccount?.user.username}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="font-medium text-muted-foreground">Date</span>
                            <span className="font-semibold">{date ? format(date, "PPP") : "-"}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="font-medium text-muted-foreground">Time</span>
                            <span className="font-semibold">{time}</span>
                        </div>
                        <div className="pt-2">
                            <span className="font-medium text-muted-foreground block mb-1">Content</span>
                            <p className="text-sm bg-background p-2 rounded border">{text}</p>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="ghost" onClick={() => setShowConfirmation(false)}>Back</Button>
                        <Button onClick={handleConfirmSubmit} disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Confirm Schedule
                        </Button>
                    </div>
                </div>
            </NeoModal>
        </>);

}