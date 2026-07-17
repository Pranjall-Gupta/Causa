package com.causa.backend.controller;

import com.causa.backend.dto.DashboardSummary;
import com.causa.backend.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired private DashboardService dashboardService;

    @GetMapping("/summary")
    public DashboardSummary summary() {
        return dashboardService.getSummary();
    }
}
