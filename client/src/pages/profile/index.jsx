import { useEffect, useState, useRef } from "react";
import { useAppStore } from "../../store"
import {useNavigate} from 'react-router-dom';
import {ArrowLeft, Trash2, Plus} from 'lucide-react'
import { Avatar, AvatarImage } from "../../components/ui/avatar";
import { colors, getColor } from "../../lib/utils";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button"; 
import { toast } from "sonner";
import {apiClient} from "../../lib/api-client";
import { UPDATE_PROFILE_ROUTE } from "../../utils/constants";


const Profile = () => {
  const navigate = useNavigate();
  const {userInfo, setUserInfo} = useAppStore();
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [image, setImage] = useState(null)
  const [hovered, setHovered] = useState(false)
  const [selectedColor, setSelectedColor] = useState(0);
  const fileInputRef = useRef(null);

  useEffect(()=>{
    if(userInfo.profileSetup){
      setFirstName(userInfo.firstName)
      setLastName(userInfo.lastName)
      setSelectedColor(userInfo.color)
    }
  }, [userInfo])

  const validateProfile = () => {
    if (!firstName || !lastName || selectedColor === undefined || selectedColor === null) {
      toast.error("Please fill in all the fields");
      return false;
    }
  
    return true;
  }

const handleFileInputClick = () => {
  fileInputRef.current.click();
}

const handleImageChange = async (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target.result);
    };
    reader.readAsDataURL(file);
  }
}

const handleDeleteImage = () => {
  setImage(null);
}

  const saveChanges = async()=>{
    if(validateProfile()) {
      try {
        const response = await apiClient.post(UPDATE_PROFILE_ROUTE, {
          firstName,
          lastName,
          image,
          color: selectedColor
        }, {withCredentials: true});

        if (response.status === 201) {
          setUserInfo({...response.data});
          toast.success("Profile updated successfully");
          navigate('/chat')
        } 
   } catch(err){
        toast.error(err.response?.data?.message || "An error occurred while updating profile");
   }  
  }
}

const handleNavigate = () => {
 if(userInfo.profileSetup) navigate('/chat')
  else toast.error("Please fill in all the fields")
}
   return (
    <div className="h-[100vh] bg-[#1b1c24] flex items-center justify-center flex-col gap-10">
      <div className="flex flex-col gap-10 w-[80vw] md:w-max">
        <div className="">
          <ArrowLeft className="text-4xl lg:text-6xl text-white/90 cursor-pointer" onClick={handleNavigate}/>
        </div>
        <div className="grid grid-cols">
          <div className="h-full w-32 md:w-48 md:h-48 relative flex items-center justify-center" onMouseEnter={()=> setHovered(true)} onMouseLeave={()=> setHovered(false)}>
            <Avatar className={'h-32 w-32 md:w-48 md:h-48 rounded-full overflow-hidden'}>
              {
                image ? <AvatarImage src={image} alt={'profile'} className={'object-cover w-full h-full bg-black'}/> :<div className={`uppercase h-32 w-32 md:w-48 md:h-48 text-5xl border flex items-center justify-center rounded-full ${getColor(selectedColor)}`}>
                  {firstName ? firstName[0] : userInfo.email[0]}
                </div>
              }
            </Avatar> 
            {
              hovered && (
                <div 
                  className="absolute inset-0 bg-black/50 flex items-center justify-center text-white cursor-pointer rounded-full"
                  onClick={image ? handleDeleteImage : handleFileInputClick}
                >
                  {image ? <Trash2 className="text-white text-3xl cursor-pointer"/>: <Plus className="text-white text-3xl cursor-pointer"/>}
                </div>
              )
            }
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleImageChange} 
              accept=".png, .jpg, .jpeg, .svg, .webp"
            />
          </div>
              <div className="flex min-w-32 md:min-w-64 flex-col gap-5 text-white items-center justify-center">
                <div className="w-full">
                  <Input placeholder='Email' type='email' disabled value={userInfo.email} className='rounded-lg p-6 bg-[#2c2e3b] border-none'/>
                </div>
                <div className="w-full">
                  <Input placeholder='First Name' type='text'  value={firstName} onChange={(e)=> setFirstName(e.target.value)} className='rounded-lg p-6 bg-[#2c2e3b] border-none'/>
                </div>
                <div className="w-full">
                  <Input placeholder='Last Name' type='text'  value={lastName} onChange={(e)=> setLastName(e.target.value)} className='rounded-lg p-6 bg-[#2c2e3b] border-none'/>
                </div>
           
                <div className="w-full flex gap-5">
                  {
colors.map((color, index) => <div className={`${color} h-8 w-8 rounded-full cursor-pointer transition-all duration-300 ${selectedColor === index ? " outline-white/50 outline-1": ""}`} key={index} onClick={()=> setSelectedColor(index)}></div>)
                  }
                </div>
              </div>

        </div>
        <div className="w-full">
          <Button className='h-16 w-full bg-purple-500 hover:bg-purple-900 transition-all duration-300' onClick={saveChanges}> Save Changes</Button>
        </div>
      </div>
    </div>
  )
}

export default Profile