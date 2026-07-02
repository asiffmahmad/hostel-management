import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { publicApi } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Building2, UserRound, GraduationCap, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const registrationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^\d{10}$/, 'Phone number must be exactly 10 digits'),
  parentPhone: z.string().regex(/^\d{10}$/, 'Phone number must be exactly 10 digits').optional().or(z.literal('')),
  fatherName: z.string().optional(),
  aadhaarNumber: z.string().optional(),
  address: z.string().min(5, 'Address is required'),
  hostelCode: z.string().min(1, 'Please select a hostel'),
  roomNumber: z.string().min(1, 'Please select a room'),
  bedName: z.string().min(1, 'Please select a bed'),
});

type RegistrationFormValues = z.infer<typeof registrationSchema>;

const StudentRegistration = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [hostels, setHostels] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [beds, setBeds] = useState<any[]>([]);

  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      parentPhone: '',
      fatherName: '',
      aadhaarNumber: '',
      address: '',
      hostelCode: '',
      roomNumber: '',
      bedName: '',
    },
  });

  const selectedHostelCode = form.watch('hostelCode');
  const selectedRoomNumber = form.watch('roomNumber');

  // Fetch hostels on mount
  useEffect(() => {
    publicApi.get('/public/hostels').then((res) => {
      setHostels(res.data);
    }).catch(err => {
      console.error("Error fetching hostels", err);
    });
  }, []);

  // Fetch rooms when hostel changes
  useEffect(() => {
    form.setValue('roomNumber', '');
    form.setValue('bedName', '');
    setRooms([]);
    setBeds([]);

    if (selectedHostelCode) {
      const hostel = hostels.find(h => h.hostelCode === selectedHostelCode);
      if (hostel) {
        publicApi.get(`/public/hostels/${hostel.id}/rooms`).then((res) => {
          setRooms(res.data);
        }).catch(err => {
          console.error("Error fetching rooms", err);
        });
      }
    }
  }, [selectedHostelCode, hostels, form]);

  // Fetch beds when room changes
  useEffect(() => {
    form.setValue('bedName', '');
    setBeds([]);

    if (selectedRoomNumber && rooms.length > 0) {
      const room = rooms.find(r => r.roomNumber === selectedRoomNumber);
      if (room) {
        publicApi.get(`/public/rooms/${room.id}/beds`).then((res) => {
          setBeds(res.data);
        }).catch(err => {
          console.error("Error fetching beds", err);
        });
      }
    }
  }, [selectedRoomNumber, rooms, form]);

  const onSubmit = async (data: RegistrationFormValues) => {
    setIsSubmitting(true);
    try {
      await publicApi.post('/public/students/register', data);
      setSuccess(true);
      toast({
        title: 'Registration Successful',
      });
    } catch (error: any) {
      toast({
        title: error.response?.data?.message || 'Registration Failed',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg border-green-100">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <CardTitle className="text-2xl text-green-800">Registration Complete!</CardTitle>
            <CardDescription className="text-base mt-2">
              You have successfully registered and been assigned to your room.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pt-6">
            <Button variant="outline" onClick={() => window.location.reload()}>
              Register Another Student
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      <div className="w-full max-w-3xl mb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Building2 className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Hostel Registration</h1>
        </div>
        <p className="text-slate-600">Please fill out this form to register and select your room.</p>
      </div>

      <Card className="w-full max-w-3xl shadow-xl border-slate-200/60 overflow-hidden">
        <div className="h-2 w-full bg-gradient-to-r from-primary to-blue-600"></div>
        <CardContent className="p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-lg font-semibold text-slate-800 pb-2 border-b">
                  <UserRound className="h-5 w-5 text-primary" />
                  <h3>Personal Information</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="john@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="10-digit number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="aadhaarNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Aadhaar / ID Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Optional" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-lg font-semibold text-slate-800 pb-2 border-b">
                  <MapPin className="h-5 w-5 text-primary" />
                  <h3>Contact & Address</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="fatherName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Father/Guardian Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Optional" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="parentPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Emergency Contact (Phone)</FormLabel>
                        <FormControl>
                          <Input placeholder="10-digit number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem className="col-span-1 md:col-span-2">
                        <FormLabel>Full Address</FormLabel>
                        <FormControl>
                          <textarea 
                            placeholder="Enter your full permanent address" 
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none" 
                            rows={3} 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-lg font-semibold text-slate-800 pb-2 border-b">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  <h3>Hostel Selection</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="hostelCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hostel</FormLabel>
                        <select 
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          onChange={field.onChange} 
                          value={field.value}
                        >
                          <option value="" disabled>Select Hostel</option>
                          {hostels.map(h => (
                            <option key={h.id} value={h.hostelCode}>{h.name}</option>
                          ))}
                        </select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="roomNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Room</FormLabel>
                        <select 
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          onChange={field.onChange} 
                          value={field.value} 
                          disabled={!selectedHostelCode || rooms.length === 0}
                        >
                          <option value="" disabled>Select Room</option>
                          {rooms.map(r => (
                            <option key={r.id} value={r.roomNumber}>Room {r.roomNumber}</option>
                          ))}
                        </select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bedName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bed</FormLabel>
                        <select 
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          onChange={field.onChange} 
                          value={field.value} 
                          disabled={!selectedRoomNumber || beds.length === 0}
                        >
                          <option value="" disabled>Select Bed</option>
                          {beds.map(b => (
                            <option key={b.id} value={b.bedName}>{b.bedName}</option>
                          ))}
                        </select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="pt-6 flex justify-end gap-4">
                <Button type="button" variant="outline" asChild>
                  <Link to="/login">Back to Login</Link>
                </Button>
                <Button type="submit" size="lg" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Register Now'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentRegistration;
