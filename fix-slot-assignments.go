package main

import (
	"log"

	"scentral-dashboard/database"
	"scentral-dashboard/models"
)

func main() {
	// Initialize database connection
	if err := database.Init(); err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}

	// Get all videos
	var videos []models.Video
	if err := database.DB.Find(&videos).Error; err != nil {
		log.Fatalf("Failed to get videos: %v", err)
	}

	// Get all slots
	var slots []models.Slot
	if err := database.DB.Find(&slots).Error; err != nil {
		log.Fatalf("Failed to get slots: %v", err)
	}

	// Get machine ID 6
	var machine models.Machine
	if err := database.DB.Where("code = ?", "6").First(&machine).Error; err != nil {
		log.Fatalf("Failed to get machine: %v", err)
	}

	// Create slot assignments for videos that don't have them
	for _, video := range videos {
		if video.AdType == "default" {
			continue // Skip default videos
		}

		// Check if video already has a slot assignment
		var assignment models.SlotAssignment
		err := database.DB.Where("video_id = ? AND (machine_id IS NULL OR machine_id = ?)", video.ID, machine.ID).First(&assignment).Error
		if err == nil {
			log.Printf("Video %d (%s) already has slot assignment %d", video.ID, video.Title, assignment.ID)
			continue
		}

		// Find a suitable slot based on video type
		var targetSlot models.Slot
		if video.AdType == "perfume" {
			// Find a slot that allows perfume ads
			for _, slot := range slots {
				if slot.AllowPerfume && slot.Status == "ACTIVE" {
					targetSlot = slot
					break
				}
			}
		} else {
			// Find a slot that allows general ads
			for _, slot := range slots {
				if slot.AllowGeneral && slot.Status == "ACTIVE" {
					targetSlot = slot
					break
				}
			}
		}

		if targetSlot.ID == 0 {
			log.Printf("No suitable slot found for video %d (%s)", video.ID, video.Title)
			continue
		}

		// Create slot assignment
		assignment = models.SlotAssignment{
			SlotID:    targetSlot.ID,
			VideoID:   video.ID,
			MachineID: &machine.ID,
			Status:    "ACTIVE",
			AdType:    video.AdType,
		}

		if err := database.DB.Create(&assignment).Error; err != nil {
			log.Printf("Failed to create slot assignment for video %d: %v", video.ID, err)
			continue
		}

		log.Printf("Created slot assignment %d for video %d (%s) in slot %d (%s)",
			assignment.ID, video.ID, video.Title, targetSlot.ID, targetSlot.Name)
	}

	// Check for 08:00 slot specifically
	var morningSlot models.Slot
	if err := database.DB.Where("start_time <= ? AND end_time > ?", "08:00:00", "08:00:00").First(&morningSlot).Error; err != nil {
		log.Printf("No slot found for 08:00: %v", err)
	} else {
		log.Printf("Found morning slot: %d (%s) from %s to %s",
			morningSlot.ID, morningSlot.Name, morningSlot.StartTime, morningSlot.EndTime)

		// Get assignments for this slot
		var assignments []models.SlotAssignment
		if err := database.DB.Where("slot_id = ?", morningSlot.ID).Preload("Video").Find(&assignments).Error; err != nil {
			log.Printf("Failed to get assignments for morning slot: %v", err)
		} else {
			log.Printf("Morning slot has %d assignments:", len(assignments))
			for _, assignment := range assignments {
				log.Printf("  - Video %d: %s (%s)",
					assignment.Video.ID, assignment.Video.Title, assignment.AdType)
			}
		}
	}

	log.Println("Slot assignment fix completed")
}
