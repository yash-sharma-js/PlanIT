
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar, Clock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

// Mock data for meetings
const MOCK_MEETINGS = [
  {
    id: "1",
    title: "Weekly Team Standup",
    time: "09:30 AM - 10:00 AM",
    date: "2023-10-16",
    participants: 8,
    description: "Regular team check-in to discuss progress and blockers."
  },
  {
    id: "2",
    title: "Product Review",
    time: "11:00 AM - 12:00 PM",
    date: "2023-10-16",
    participants: 5,
    description: "Review latest product features and gather feedback."
  },
  {
    id: "3",
    title: "Client Presentation",
    time: "02:00 PM - 03:30 PM",
    date: "2023-10-17",
    participants: 4,
    description: "Present project progress to client stakeholders."
  },
  {
    id: "4",
    title: "Sprint Planning",
    time: "10:00 AM - 12:00 PM",
    date: "2023-10-18",
    participants: 7,
    description: "Plan tasks and goals for the upcoming sprint."
  },
  {
    id: "5",
    title: "Design Review",
    time: "01:30 PM - 02:30 PM",
    date: "2023-10-19",
    participants: 3,
    description: "Review and critique new design concepts."
  }
];

const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'long',
    month: 'long', 
    day: 'numeric',
    year: 'numeric'
  };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

const Meetings = () => {
  const { user } = useAuth();
  const [meetings] = useState(MOCK_MEETINGS);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Meetings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your scheduled meetings and events
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {meetings.map((meeting) => (
          <Card key={meeting.id} className="glass-panel glass-panel-hover">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl">{meeting.title}</CardTitle>
                <Badge variant="outline">{meeting.participants} participants</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{meeting.description}</p>
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>{formatDate(meeting.date)}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Clock className="mr-2 h-4 w-4" />
                  <span>{meeting.time}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Users className="mr-2 h-4 w-4" />
                  <span>
                    <span className="font-medium">Organizer:</span> {user?.name}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Meetings;
