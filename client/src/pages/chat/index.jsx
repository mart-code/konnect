import { useNavigate } from "react-router-dom";
import { useAppStore } from "../../store";
import { toast } from "sonner";
import { useEffect } from "react";

const Chat = () => {
  const { userInfo } = useAppStore();
  const navigate = useNavigate();
  useEffect(() => {
    if (!userInfo.profileSetup) {
      toast("Please complete your profile before accessing the chat.", {
        type: "info",
      });
      navigate("/profile");
    }
  }, [navigate, userInfo]);

  return <div>Chat</div>;
};

export default Chat;
