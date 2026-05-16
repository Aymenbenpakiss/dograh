"use client";

import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/auth';

export default function OverviewPage() {
    const { user } = useAuth();

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
                {/* Welcome Card */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="text-3xl">
                            {`Welcome${user?.displayName ? `, ${user.displayName.split(' ')[0]}` : ''} to LoanDialer`}
                        </CardTitle>
                        <CardDescription className="text-lg mt-2">
                            AI voice agents that follow up on mortgage leads while you sleep. Build a campaign, upload a lead list, and let the agent qualify borrowers, schedule callbacks, and surface hot leads back to your pipeline.
                        </CardDescription>
                    </CardHeader>
                </Card>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Set up your loan follow-up agent</CardTitle>
                            <CardDescription>
                                Build a voice agent for lead qualification, refi outreach, or pre-approval follow-up using the visual editor.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button asChild>
                                <Link href="/workflow">
                                    Go to Agents
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Configure voice and language models</CardTitle>
                            <CardDescription>
                                Pick the LLM, voice (TTS), and transcription (STT) providers your agents will use on calls.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button asChild variant="outline">
                                <Link href="/model-configurations">
                                    Configure Models
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Launch a lead-follow-up campaign</CardTitle>
                            <CardDescription>
                                Upload a list of mortgage leads, attach an agent, and start placing outbound calls.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button asChild variant="outline">
                                <Link href="/campaigns">
                                    Go to Campaigns
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Set up caller IDs and telephony</CardTitle>
                            <CardDescription>
                                Bring your own Twilio account or use a managed number to start dialing.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button asChild variant="outline">
                                <Link href="/telephony-configurations">
                                    Telephony
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
